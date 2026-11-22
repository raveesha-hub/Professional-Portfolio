import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface AssistantRequestBody {
  question?: unknown;
  history?: unknown;
  portfolioContext?: unknown;
}

function sanitizePortfolioContext(raw: unknown): string {
  if (!raw || typeof raw !== 'object') {
    return '{}';
  }
  try {
    const json = JSON.stringify(raw);
    return json.slice(0, 18000);
  } catch {
    return '{}';
  }
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '512kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(aiClient),
    });
  });

  app.post('/api/assistant', async (req: Request, res: Response) => {
    const body = (req.body || {}) as AssistantRequestBody;
    const question =
      typeof body.question === 'string' ? body.question.trim() : '';

    if (!question) {
      res.status(400).json({ error: 'Please provide a question.' });
      return;
    }

    if (question.length > 600) {
      res.status(400).json({
        error: 'Question is too long. Please keep questions under 600 characters.',
      });
      return;
    }

    if (!aiClient) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured in the server environment. Configure it in Settings > Secrets to enable live AI responses.',
      });
      return;
    }

    const contextJson = sanitizePortfolioContext(body.portfolioContext);

    const rawHistory = Array.isArray(body.history) ? body.history : [];
    const safeHistory: ChatHistoryTurn[] = rawHistory
      .slice(-6)
      .filter(
        (item): item is ChatHistoryTurn =>
          Boolean(item) &&
          typeof item === 'object' &&
          ((item as ChatHistoryTurn).role === 'user' ||
            (item as ChatHistoryTurn).role === 'model') &&
          typeof (item as ChatHistoryTurn).text === 'string'
      )
      .map((item) => ({
        role: item.role,
        text: item.text.slice(0, 1200),
      }));

    const conversationSummary = safeHistory
      .map(
        (turn) =>
          `${turn.role === 'user' ? 'Visitor' : 'Assistant'}: ${turn.text}`
      )
      .join('\n');

    const systemInstruction = `You are Raveesha's verified Portfolio AI Assistant on Project R – Beyond Digital.
STRICT GROUNDING RULES:
1. Answer ONLY using facts explicitly present in the VERIFIED_PORTFOLIO_DATA JSON below.
2. NEVER invent, guess, or extrapolate qualifications, grades, certifications, dates, job titles, skill proficiency percentages, GitHub commit counts, or project details not explicitly stored in VERIFIED_PORTFOLIO_DATA.
3. If the visitor asks for something not present in VERIFIED_PORTFOLIO_DATA, clearly say that it is not listed in Raveesha's portfolio and offer Raveesha's listed contact email or Contact section.
4. Keep responses concise, friendly, accurate, and formatted cleanly in plain text or short bullet lines without excessive jargon.

VERIFIED_PORTFOLIO_DATA:
${contextJson}`;

    const promptContent = conversationSummary
      ? `Recent conversation:\n${conversationSummary}\n\nLatest visitor question: ${question}`
      : question;

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptContent,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const answer = (response.text ?? '').trim();
      if (!answer) {
        res.status(502).json({
          error: 'The AI assistant returned an empty response. Please try again.',
        });
        return;
      }

      res.json({ answer });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reach Gemini API.';
      console.error('Gemini assistant error:', message);
      res.status(502).json({
        error: `AI Assistant error: ${message}`,
      });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Production build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
