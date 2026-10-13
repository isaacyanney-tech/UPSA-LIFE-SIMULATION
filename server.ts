import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

// Multi-Turn AI Chat with Search Grounding
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, history, studentContext, useSearch = false } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const studentName = studentContext?.name || 'UPSA Scholar';
    const programme = studentContext?.programme || 'Information Technology & Business';
    const level = studentContext?.level || 100;
    const gpa = studentContext?.gpa || 3.75;

    const systemInstruction = `You are "UPSA Genius AI", the virtual peer academic mentor and campus guide at the University of Professional Studies, Accra (UPSA), Ghana.
You assist ${studentName}, a Level ${level} student studying ${programme} with a GPA of ${gpa}.
Personality and Tone:
- Encouraging, intelligent, warm, articulate, and culturally authentic Ghanaian university voice (uses student terms like "Chale", "Sharp", "Solid work", "You got this").
- Expert in UPSA academic faculties: Accounting & Finance, Information Technology, Business Administration, Marketing, and Law.
- Real campus landmarks: Lecture Block Complex (LBC), Central Library, AstroTurf sports pitch, Banking Square, Students Centre (Auntie Mansah's Waakye spot), Access Hostel, and Mandela Block.
- Provide structured answers, clean bullet points, and practical examples for academic concepts.
- When answering real-world or university questions with search grounding, provide accurate, verified facts.`;

    if (aiClient) {
      try {
        // Build multi-turn contents from history
        const contents: any[] = [];

        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            contents.push({
              role: item.role === 'model' ? 'model' : 'user',
              parts: [{ text: item.text }],
            });
          }
        }

        // Add current user message
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        // Use gemini-3.5-flash with search grounding if requested or for real-time queries
        const modelName = useSearch ? 'gemini-3.5-flash' : 'gemini-3.8-flash';
        const config: any = {
          systemInstruction,
        };

        if (useSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await aiClient.models.generateContent({
          model: modelName,
          contents,
          config,
        });

        const reply = response.text || 'Keep studying hard, UPSA scholar!';

        // Extract Search Grounding sources if available
        let sources: Array<{ title: string; url: string }> = [];
        const metadata = (response as any).candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          sources = metadata.groundingChunks
            .filter((chunk: any) => chunk.web?.uri)
            .map((chunk: any) => ({
              title: chunk.web?.title || 'Source',
              url: chunk.web?.uri,
            }))
            .slice(0, 3);
        }

        return res.json({ reply, sources });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using intelligent campus fallback:', geminiError?.message);
      }
    }

    // Intelligent campus fallback response if API key is not set or network is unreachable
    const lower = message.toLowerCase();
    let fallbackReply = `Chale! As a proud UPSA scholar studying ${programme}, revision at the Central Library and active participation in the LBC lectures are the proven foundation for First Class Honours!`;

    if (lower.includes('account') || lower.includes('balance') || lower.includes('debit') || lower.includes('credit')) {
      fallbackReply = `📊 Fundamental Accounting Rule: The accounting equation must always balance: Assets = Liabilities + Owner's Equity! Remember to Debit assets and expenses when they increase, and Credit revenues and liabilities when they increase. Dr. Boateng will test this in LBC Hall 4!`;
    } else if (lower.includes('it') || lower.includes('code') || lower.includes('python') || lower.includes('algorithm')) {
      fallbackReply = `💻 Tech Insight: Algorithms are step-by-step instructions. For queues, use First-In First-Out (FIFO); for stacks, use Last-In First-Out (LIFO). Practice coding in the LBC Computer Lab 2!`;
    } else if (lower.includes('food') || lower.includes('eat') || lower.includes('waakye') || lower.includes('jollof')) {
      fallbackReply = `🍛 Campus Dining: Auntie Mansah's Food Spot at the Students Centre has hot Waakye with shito, boiled eggs, fried plantain, and chilled Sobolo! It instantly restores your Hunger (+40%) and Happiness (+35%).`;
    } else if (lower.includes('hostel') || lower.includes('sleep') || lower.includes('room')) {
      fallbackReply = `🛌 Hostel Quad: Access Hostel and Mandela Block offer comfortable 1-4 occupant rooms. Always get at least 6-8 hours of sleep in your room bed to keep your Energy at 100% for lectures!`;
    } else if (lower.includes('gpa') || lower.includes('grade') || lower.includes('exam')) {
      fallbackReply = `🎓 First Class Standing: UPSA requires a Cumulative GPA between 3.60 and 4.00. High attendance, acing the lecture quizzes, and scoring high in mid-sems will secure your degree!`;
    } else if (lower.includes('money') || lower.includes('momo') || lower.includes('cedi') || lower.includes('bank')) {
      fallbackReply = `📱 Finances & MoMo: Manage your funds with CampusPay / MTN MoMo. You can receive allowance transfers from home or pick up student gigs at the Banking Square to earn up to GH₵ 110 per shift!`;
    }

    return res.json({ reply: fallbackReply, sources: [] });
  } catch (error: any) {
    console.error('Server error handling AI chat:', error);
    return res.status(500).json({ error: 'Failed to process AI chat request' });
  }
});

// Setup Vite middlewares in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UPSA Life server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
