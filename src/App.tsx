import React, { useState } from 'react';
import { Sidebar, NavTab } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { TopBar } from './components/navigation/TopBar';
import { FeedView } from './components/feed/FeedView';
import { ExploreView } from './components/explore/ExploreView';
import { NearbyPeopleView } from './components/nearby/NearbyPeopleView';
import { ReelsFeed } from './components/reels/ReelsFeed';
import { ChatLayout } from './components/chat/ChatLayout';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { CreatePostModal } from './components/create/CreatePostModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { CallOverlay } from './components/call/CallOverlay';
import { useAuth } from './context/AuthContext';

export function App() {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | undefined>(undefined);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      setSelectedProfileUserId(currentUser?.id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectUser = (userId: string) => {
    setSelectedProfileUserId(userId);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-pink-500 selection:text-white transition-colors duration-200">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      />

      {/* Main Responsive Canvas Container */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-64 lg:ml-72 pb-20 md:pb-6">
        {/* Mobile Top Navigation Bar */}
        <TopBar
          onSelectTab={handleSelectTab}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        />

        {/* View Router */}
        <div className="flex-1 w-full">
          {activeTab === 'feed' && (
            <FeedView
              onSelectUser={handleSelectUser}
              onOpenCreatePost={() => setIsCreatePostOpen(true)}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              onSelectUser={handleSelectUser}
              onOpenNearby={() => handleSelectTab('nearby')}
            />
          )}

          {activeTab === 'nearby' && (
            <NearbyPeopleView
              onSelectUser={handleSelectUser}
              onOpenMessages={() => handleSelectTab('messages')}
            />
          )}

          {activeTab === 'reels' && (
            <ReelsFeed onSelectUser={handleSelectUser} />
          )}

          {activeTab === 'messages' && (
            <ChatLayout onSelectUser={handleSelectUser} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView onSelectUser={handleSelectUser} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userId={selectedProfileUserId}
              onSelectUser={handleSelectUser}
              onOpenSettings={() => handleSelectTab('settings')}
              onOpenCreatePost={() => setIsCreatePostOpen(true)}
            />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
      />

      {/* Global Modals & Overlays */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen || !currentUser}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CallOverlay />
    </div>
  );
}

export default App;
