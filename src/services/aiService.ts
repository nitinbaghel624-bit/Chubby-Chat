export interface GenerateCaptionParams {
  topic: string;
  tone?: 'engaging' | 'funny' | 'aesthetic' | 'professional' | 'hyped';
  keywords?: string;
}

export interface GenerateCaptionResult {
  caption: string;
  suggestedHashtags: string[];
}

export class AIService {
  static async generateCaption(params: GenerateCaptionParams): Promise<GenerateCaptionResult> {
    try {
      const res = await fetch('/api/ai/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Caption generation fallback:', e);
      return {
        caption: `✨ Making everyday moments unforgettable with ${params.topic || 'good vibes'}! 💫 #ChubbyChat #DailyVibes`,
        suggestedHashtags: ['#ChubbyChat', '#Trending', '#Vibes', '#Explore'],
      };
    }
  }

  static async suggestHashtags(content: string): Promise<string[]> {
    try {
      const res = await fetch('/api/ai/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.hashtags || [];
    } catch (e) {
      return ['#ChubbyChat', '#Social', '#Trending', '#ExplorePage'];
    }
  }

  static async rewriteMessage(text: string, style: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.rewritten || text;
    } catch (e) {
      return text;
    }
  }

  static async getConversationStarters(userName: string, userBio: string, mutualInterests: string[] = []): Promise<string[]> {
    try {
      const res = await fetch('/api/ai/starters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, userBio, mutualInterests }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.starters || [];
    } catch (e) {
      return [
        `Hey ${userName}! Saw your profile and loved your style!`,
        `Hey! How is your week going?`,
        `What projects or hobbies are you currently excited about?`,
      ];
    }
  }

  static async summarizeConversation(messages: any[]): Promise<string> {
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.summary || 'Summary unavailable';
    } catch (e) {
      return 'Recent message updates and active chat discussion.';
    }
  }

  static async translateMessage(text: string, targetLanguage: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.translatedText || text;
    } catch (e) {
      return text;
    }
  }

  static async suggestBio(about: string): Promise<string> {
    try {
      const res = await fetch('/api/ai/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.bio || `Creative spirit ✨ | Design & Aesthetic lover 🌸 | Living life in full color 💫`;
    } catch (e) {
      return `Creative explorer 📸 | Design & Vibes enthusiast ✨ | Always looking for the next adventure 🌆`;
    }
  }

  static async suggestReplies(recentMessage: string, senderName: string): Promise<string[]> {
    try {
      const res = await fetch('/api/ai/suggest-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recentMessage, senderName }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data.replies || ['Sounds good! 👍', 'Haha love it! 😂', 'Let me check!'];
    } catch (e) {
      return ['Sounds good! 👍', 'Love that! ❤️', 'Talk to you soon! ✨'];
    }
  }

  static async suggestSmartReplies(recentMessage: string, senderName: string): Promise<string[]> {
    return this.suggestReplies(recentMessage, senderName);
  }

  static async moderateContent(text: string): Promise<{ isSafe: boolean; flagged?: boolean; flags: string[]; reason?: string }> {
    try {
      const res = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return {
        isSafe: data.isSafe ?? true,
        flagged: data.flagged ?? !data.isSafe,
        flags: data.flags || [],
        reason: data.reason,
      };
    } catch (e) {
      return { isSafe: true, flagged: false, flags: [] };
    }
  }

}
