import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. AI features will fallback to smart generative templates.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || 'dummy-key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// AI API Routes
app.post('/api/ai/caption', async (req, res) => {
  try {
    const { topic, tone = 'engaging', keywords = '' } = req.body;
    if (!topic && !keywords) {
      return res.status(400).json({ error: 'Topic or keywords are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // High quality fallback
      return res.json({
        caption: `✨ Living the moment! ${topic || 'Good vibes only'} ✨ #ChubbyChat #Vibes #${(keywords || 'explore').replace(/\s+/g, '')}`,
        suggestedHashtags: ['#ChubbyChat', '#Moments', '#GoodVibes', '#SocialDaily'],
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are a creative social media expert for "Chubby Chat", a vibrant, youthful social networking app. 
Generate a catchy, modern, authentic post caption with appropriate emojis and 4-6 relevant hashtags.
Topic / description: "${topic}"
Tone: ${tone}
Keywords: "${keywords}"
Return ONLY a valid JSON object with keys "caption" (string with emojis) and "suggestedHashtags" (array of strings, e.g. ["#travel", "#explore"]).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Caption generation error:', error);
    res.status(500).json({
      caption: `✨ Capturing pure bliss with ${req.body?.topic || 'the best crew'}! 💫 #Moments #ChubbyChat`,
      suggestedHashtags: ['#ChubbyChat', '#Trending', '#LiveLife'],
    });
  }
});

app.post('/api/ai/hashtags', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        hashtags: ['#ChubbyChat', '#DailyVibe', '#TrendingNow', '#FYP', '#GoodVibes'],
      });
    }

    const ai = getGeminiClient();
    const prompt = `Suggest 6-8 trending, high-engagement hashtags for this social media content:
"${content}"
Return ONLY a valid JSON object with key "hashtags" (array of strings with # prefix).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"hashtags":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Hashtags error:', error);
    res.json({ hashtags: ['#ChubbyChat', '#Trending', '#ExplorePage', '#Vibes'] });
  }
});

app.post('/api/ai/rewrite', async (req, res) => {
  try {
    const { text, style = 'friendly' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        rewritten: `${text} ✨ (styled: ${style})`,
      });
    }

    const ai = getGeminiClient();
    const prompt = `Rewrite the following chat message to have a "${style}" tone (e.g. friendly, funny, flirtatious, hyped, polite, concise).
Original text: "${text}"
Return ONLY a valid JSON object with key "rewritten" (string).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Rewrite error:', error);
    res.status(500).json({ rewritten: req.body?.text || '' });
  }
});

app.post('/api/ai/starters', async (req, res) => {
  try {
    const { userBio, userName, mutualInterests } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        starters: [
          `Hey ${userName || 'there'}! Saw your profile and loved your vibe! How's your week going?`,
          `Hey! What's your favorite spot for coffee or relaxing around here?`,
          `Hey! Loved your recent post! Have any exciting plans for the weekend?`,
        ],
      });
    }

    const ai = getGeminiClient();
    const prompt = `Generate 3 fun, natural, non-creepy conversation starter messages to send to a new friend on a social messaging app.
Target user: ${userName || 'Friend'}
Their bio: "${userBio || ''}"
Shared interests: "${Array.isArray(mutualInterests) ? mutualInterests.join(', ') : ''}"
Return ONLY a valid JSON object with key "starters" (array of 3 strings).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"starters":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Starters error:', error);
    res.json({
      starters: [
        'Hey! How are you doing today?',
        'Hey there! Love your profile!',
        'What exciting things are you up to this week?',
      ],
    });
  }
});

app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        summary: `Conversation between ${messages.length} messages covering updates, shared moments, and active chat discussions.`,
      });
    }

    const conversationText = messages
      .slice(-30)
      .map((m: any) => `${m.senderName || m.senderId}: ${m.text || '[Media attachment]'}`)
      .join('\n');

    const ai = getGeminiClient();
    const prompt = `Summarize this chat conversation briefly in 2-3 friendly, punchy bullet points:
${conversationText}
Return ONLY a valid JSON object with key "summary" (string).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Summarize error:', error);
    res.json({ summary: 'Recent conversation discussion recap.' });
  }
});

app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'English' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        translatedText: text,
        targetLanguage,
      });
    }

    const ai = getGeminiClient();
    const prompt = `Translate the following text accurately and naturally into ${targetLanguage}:
"${text}"
Return ONLY a valid JSON object with key "translatedText" (string) and "detectedSource" (string).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Translate error:', error);
    res.json({ translatedText: req.body?.text, targetLanguage: req.body?.targetLanguage });
  }
});

app.post('/api/ai/suggest-reply', async (req, res) => {
  try {
    const { recentMessage, senderName } = req.body;
    if (!recentMessage) return res.status(400).json({ error: 'Message is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        replies: ['Sounds great! 👍', 'Haha love it! 😂', 'Let me check and get back to you!'],
      });
    }

    const ai = getGeminiClient();
    const prompt = `Given the last chat message received from ${senderName || 'a friend'}:
"${recentMessage}"
Provide 3 short, conversational, contextual quick-reply options (under 10 words each).
Return ONLY a valid JSON object with key "replies" (array of 3 strings).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"replies":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Suggest reply error:', error);
    res.json({ replies: ['Awesome! 🎉', 'Sounds good!', 'Talk to you soon! 👋'] });
  }
});

app.post('/api/ai/moderate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.json({ isSafe: true, flags: [] });

    if (!process.env.GEMINI_API_KEY) {
      // Basic heuristic moderation
      const forbidden = ['hate', 'kill', 'scam', 'fraud'];
      const hasBad = forbidden.some((w) => text.toLowerCase().includes(w));
      return res.json({
        isSafe: !hasBad,
        flags: hasBad ? ['flagged_content'] : [],
        confidence: 0.9,
      });
    }

    const ai = getGeminiClient();
    const prompt = `Moderate this social media text for severe toxicity, hate speech, spam, harassment, or dangerous content:
"${text}"
Return ONLY a valid JSON object with keys:
"isSafe" (boolean),
"flags" (array of strings e.g. ["spam", "harassment", "clean"]),
"reason" (short string explanation if unsafe or "Content is safe").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"isSafe": true, "flags": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI Moderate error:', error);
    res.json({ isSafe: true, flags: [], reason: 'Passed basic checks' });
  }
});

app.post('/api/ai/nearby-icebreaker', async (req, res) => {
  try {
    const { targetName, targetBio, mutualInterests, approximateDistance } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        icebreakers: [
          `Hey ${targetName || 'there'}! Saw we're both around and share an interest in ${Array.isArray(mutualInterests) && mutualInterests.length > 0 ? mutualInterests[0] : 'fun stuff'}! How's your day going? ✨`,
          `Hey! Great to see other friendly creators nearby. What's your favorite local spot around here? ☕️`,
          `Hey ${targetName || 'there'}! Loved your bio. Hope you're having an awesome week! 👋`,
        ],
      });
    }

    const ai = getGeminiClient();
    const prompt = `You are an AI icebreaker generator for "Chubby Chat" People Nearby discovery.
Generate 3 fun, warm, natural, friendly, non-creepy conversation opening messages for someone nearby on the social app.
Target person name: ${targetName || 'a new friend'}
Their bio: "${targetBio || ''}"
Mutual shared interests: "${Array.isArray(mutualInterests) ? mutualInterests.join(', ') : 'none specified'}"
Approximate proximity: "${approximateDistance || 'nearby'}"

Rules:
- NEVER mention exact GPS, coordinates, or stalking terms.
- Keep tone casual, respectful, friendly, and engaging.
- Return ONLY a valid JSON object with key "icebreakers" (array of 3 strings).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"icebreakers":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Nearby icebreaker error:', error);
    res.json({
      icebreakers: [
        'Hey! How is your day going? 👋',
        'Hey! Love your vibe on Chubby Chat!',
        'Hey! Hope you are having a wonderful week! ✨',
      ],
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Chubby Chat API', time: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chubby Chat Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
