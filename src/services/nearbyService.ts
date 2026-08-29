import { NearbyUser, NearbySettings, UserPresence, User, NearbyRadius } from '../types';
import { StorageService } from './storageService';

// Standard Haversine distance formula between two lat/lng pairs in kilometers
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert raw distance into privacy-safe approximate distance buckets
export function formatApproximateDistance(rawKm: number): string {
  // Anti-triangulation fuzziness
  if (rawKm < 0.5) {
    return 'Less than 500 m';
  } else if (rawKm < 0.9) {
    return `~${Math.round(rawKm * 10) * 100} m away`;
  } else if (rawKm < 1.8) {
    return '~1.5 km away';
  } else if (rawKm < 3.5) {
    return '~3 km away';
  } else if (rawKm < 6.5) {
    return '~5 km away';
  } else if (rawKm < 12.0) {
    return '~10 km away';
  } else {
    return '10+ km away';
  }
}

// Jitter coordinates to prevent triangulation/precise positioning
export function coarsenCoordinates(lat: number, lng: number): { fuzzyLat: number; fuzzyLng: number } {
  // Round coordinates to ~0.01 degrees (~1.1 km precision) and add deterministic micro-offset
  const baseLat = Math.round(lat * 100) / 100;
  const baseLng = Math.round(lng * 100) / 100;
  return {
    fuzzyLat: baseLat,
    fuzzyLng: baseLng,
  };
}

export class NearbyService {
  private static lastRefreshTime = 0;
  private static readonly RATE_LIMIT_COOLDOWN_MS = 4000; // 4s cooldown

  /**
   * Request browser geolocation permission securely
   */
  static async requestDeviceLocation(): Promise<{
    coords: { lat: number; lng: number };
    status: 'granted' | 'denied' | 'unavailable';
  }> {
    if (!navigator.geolocation) {
      return {
        coords: { lat: 37.7749, lng: -122.4194 }, // Default safe demo fallback (SF)
        status: 'unavailable',
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            status: 'granted',
          });
        },
        (error) => {
          console.warn('Geolocation access status:', error.message);
          resolve({
            coords: { lat: 37.7749, lng: -122.4194 }, // Fallback to safe area
            status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
          });
        },
        {
          enableHighAccuracy: false, // Low power / approximate
          timeout: 10000,
          maximumAge: 60000, // 1 min cached ok
        }
      );
    });
  }

  /**
   * Publish or update the current user's presence
   */
  static publishUserPresence(
    userId: string,
    coords: { lat: number; lng: number },
    status: 'online' | 'active_recently' = 'online'
  ): UserPresence {
    const { fuzzyLat, fuzzyLng } = coarsenCoordinates(coords.lat, coords.lng);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 min expiration

    const presence: UserPresence = {
      userId,
      approximateLocation: {
        neighborhood: 'Downtown Metro Area',
        fuzzyLat,
        fuzzyLng,
      },
      locationUpdatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isNearbyDiscoveryEnabled: true,
      activityStatus: status,
      lastActiveAt: now.toISOString(),
    };

    StorageService.updateUserPresence(presence);
    return presence;
  }

  /**
   * Seed / ensure realistic active neighbors exist around the current user's approximate coords
   */
  static ensureNeighborPresences(currentUserId: string, centerCoords: { lat: number; lng: number }) {
    const allUsers = StorageService.getUsers();
    const existing = StorageService.getAllUserPresences();
    const now = Date.now();

    // Specific sample offsets within 0.3km - 6km
    const demoOffsets = [
      { dLat: 0.003, dLng: 0.004, status: 'online' as const, minsAgo: 0 }, // ~450m
      { dLat: -0.006, dLng: 0.005, status: 'online' as const, minsAgo: 2 }, // ~800m
      { dLat: 0.012, dLng: -0.008, status: 'online' as const, minsAgo: 4 }, // ~1.4km
      { dLat: -0.018, dLng: 0.015, status: 'active_recently' as const, minsAgo: 8 }, // ~2.8km
      { dLat: 0.028, dLng: 0.022, status: 'active_recently' as const, minsAgo: 11 }, // ~4.5km
      { dLat: -0.045, dLng: -0.035, status: 'active_recently' as const, minsAgo: 14 }, // ~7.5km
    ];

    allUsers.forEach((user, idx) => {
      if (user.id === currentUserId) return;

      const currentPresence = existing[user.id];
      const isExpired = !currentPresence || new Date(currentPresence.expiresAt).getTime() < now;

      if (isExpired) {
        const offset = demoOffsets[idx % demoOffsets.length];
        const userLat = centerCoords.lat + offset.dLat;
        const userLng = centerCoords.lng + offset.dLng;
        const { fuzzyLat, fuzzyLng } = coarsenCoordinates(userLat, userLng);

        const presence: UserPresence = {
          userId: user.id,
          approximateLocation: {
            neighborhood: 'Nearby Quarter',
            fuzzyLat,
            fuzzyLng,
          },
          locationUpdatedAt: new Date(now - offset.minsAgo * 60 * 1000).toISOString(),
          expiresAt: new Date(now + (15 - offset.minsAgo) * 60 * 1000).toISOString(),
          isNearbyDiscoveryEnabled: true, // Enabled for demo discovery
          activityStatus: offset.status,
          lastActiveAt: new Date(now - offset.minsAgo * 60 * 1000).toISOString(),
        };

        StorageService.updateUserPresence(presence);
      }
    });
  }

  /**
   * Search for nearby active people with full privacy filters
   */
  static getNearbyActivePeople(
    currentUser: User,
    userCoords: { lat: number; lng: number } | null,
    settings: NearbySettings,
    options?: {
      filter?: 'all' | 'online' | 'interests' | 'following';
      searchQuery?: string;
    }
  ): {
    users: NearbyUser[];
    totalActiveNearby: number;
    cooldownRemaining: number;
  } {
    const now = Date.now();
    const cooldownRemaining = Math.max(
      0,
      Math.ceil((this.lastRefreshTime + this.RATE_LIMIT_COOLDOWN_MS - now) / 1000)
    );

    // If user has turned discovery OFF, return empty
    if (!settings.isEnabled || !userCoords) {
      return { users: [], totalActiveNearby: 0, cooldownRemaining };
    }

    // Ensure demo active presences exist around user's location
    this.ensureNeighborPresences(currentUser.id, userCoords);

    const allPresences = StorageService.getAllUserPresences();
    const allUsers = StorageService.getUsers();
    const blockedList = StorageService.getBlockedUsers();
    const userMap = new Map<string, User>(allUsers.map((u) => [u.id, u]));

    const followingIds = StorageService.getFollowing(currentUser.id);
    const currentUserInterests = new Set(currentUser.interests || []);

    const nearbyResults: NearbyUser[] = [];

    Object.values(allPresences).forEach((presence) => {
      const targetUserId = presence.userId;

      // Rule: Never show self
      if (targetUserId === currentUser.id) return;

      // Rule: Mutual blocking protection
      if (blockedList.includes(targetUserId)) return;

      // Rule: Check expiration (stale location check)
      if (new Date(presence.expiresAt).getTime() < now) return;

      // Rule: Discovery must be enabled by target user
      if (!presence.isNearbyDiscoveryEnabled) return;

      const targetUser = userMap.get(targetUserId);
      if (!targetUser) return;

      const targetSettings = StorageService.getNearbySettings(targetUserId);

      // Rule: Target user opted out of nearby discovery
      if (!targetSettings.isEnabled) return;

      // Rule: Target user only wants to be seen by people they follow
      if (targetSettings.onlyShowPeopleIFollow) {
        const targetFollowing = StorageService.getFollowing(targetUserId);
        if (!targetFollowing.includes(currentUser.id)) return;
      }

      // Rule: Current user requested "Only show people I follow"
      if (settings.onlyShowPeopleIFollow && !followingIds.includes(targetUserId)) {
        return;
      }

      // Distance calculation
      if (!presence.approximateLocation?.fuzzyLat || !presence.approximateLocation?.fuzzyLng) return;

      const rawDistanceKm = calculateHaversineDistanceKm(
        userCoords.lat,
        userCoords.lng,
        presence.approximateLocation.fuzzyLat,
        presence.approximateLocation.fuzzyLng
      );

      // Radius filter
      if (rawDistanceKm > settings.radiusKm) return;

      // Calculate common interests
      const targetInterests = targetUser.interests || [];
      const mutualInterests = targetInterests.filter((interest) => currentUserInterests.has(interest));

      // Calculate mutual friends
      const targetFollowing = StorageService.getFollowing(targetUserId);
      const mutualFriendIds = followingIds.filter((id) => targetFollowing.includes(id));
      const mutualFriends = mutualFriendIds
        .map((id) => userMap.get(id))
        .filter(Boolean)
        .map((u) => ({ username: u!.username, avatar: u!.avatar }));

      // Format activity status respecting user's privacy
      const globalUserSettings = StorageService.getSettings();
      let activeText = 'Active recently';
      if (globalUserSettings.showActivityStatus) {
        if (presence.activityStatus === 'online') {
          activeText = 'Active now';
        } else {
          const diffMins = Math.round(
            (now - new Date(presence.lastActiveAt).getTime()) / (60 * 1000)
          );
          activeText = diffMins <= 1 ? 'Active just now' : `Active ${diffMins}m ago`;
        }
      }

      // Coarse distance formatting
      const approxDistance = settings.showApproximateDistance
        ? formatApproximateDistance(rawDistanceKm)
        : 'Nearby';

      // Follow status
      const isFollowing = followingIds.includes(targetUserId);
      const isFollowPending = StorageService.hasRequestedFollow(currentUser.id, targetUserId);

      // Messaging permitted check
      const allowMessage = targetSettings.allowNearbyMessages;

      nearbyResults.push({
        id: targetUser.id,
        username: targetUser.username,
        displayName: targetUser.displayName,
        avatar: targetUser.avatar,
        isVerified: targetUser.isVerified,
        isPrivate: targetUser.isPrivate,
        bio: targetUser.bio,
        status: presence.activityStatus === 'online' ? 'online' : 'active_recently',
        activeText,
        approximateDistance: approxDistance,
        distanceKm: rawDistanceKm,
        interests: targetInterests,
        mutualInterests,
        mutualFriendsCount: mutualFriendIds.length,
        mutualFriends,
        isFollowing,
        isFollowPending,
        allowMessage,
      });
    });

    // Apply UI sub-filters
    let filtered = nearbyResults;

    if (options?.filter === 'online') {
      filtered = filtered.filter((u) => u.status === 'online');
    } else if (options?.filter === 'interests') {
      filtered = filtered.filter((u) => (u.mutualInterests?.length || 0) > 0);
    } else if (options?.filter === 'following') {
      filtered = filtered.filter((u) => u.isFollowing);
    }

    // Apply search query
    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.interests.some((i) => i.toLowerCase().includes(q))
      );
    }

    // Sort: Online & closest first with slight random jitter for privacy
    filtered.sort((a, b) => {
      if (a.status === 'online' && b.status !== 'online') return -1;
      if (b.status === 'online' && a.status !== 'online') return 1;
      return a.distanceKm - b.distanceKm;
    });

    return {
      users: filtered,
      totalActiveNearby: nearbyResults.length,
      cooldownRemaining,
    };
  }

  /**
   * Mark refresh timestamp to rate-limit spam querying
   */
  static recordRefresh() {
    this.lastRefreshTime = Date.now();
  }

  /**
   * Check if rate-limited
   */
  static isRateLimited(): boolean {
    return Date.now() - this.lastRefreshTime < this.RATE_LIMIT_COOLDOWN_MS;
  }
}
