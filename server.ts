import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const hasApiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

const ai = hasApiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: hasApiKey,
    model: 'gemini-3.8-flash',
  });
});

// Analyze Meeting endpoint
app.post('/api/analyze-meeting', async (req, res) => {
  try {
    const { title, date, participants, transcript } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length < 20) {
      return res.status(400).json({
        error: 'Please provide a valid transcript with at least 20 characters.',
      });
    }

    if (!ai || !hasApiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        fallbackAvailable: true,
      });
    }

    const systemInstruction = `You are DecisionBrief, an elite AI Meeting Intelligence engine built for overloaded senior managers in professional services (e.g. Corvane Group).
Your prime directive is BEHAVIOURAL RELIABILITY and AUTOMATION BIAS PROTECTION:
1. Executive Summary: Produce a crisp executive summary of NO MORE THAN 100 WORDS in clear, direct British English. Focus on: What happened, what changed, what matters to the manager, and what requires attention.
2. Decisions:
   - CONFIRMED: ONLY if explicitly agreed upon by participants in the transcript.
   - PROPOSED: Discussed, requested, or recommended, but NOT formally agreed or explicitly deferred/denied. NEVER classify a proposed decision as confirmed!
   - UNRESOLVED: Tabled, disputed, or requires further info before deciding.
   - For every decision, provide the exact transcript quote, people involved, and explanation of uncertainty. Set managerApprovalRequired to true if proposed or unresolved.
3. Action Items:
   - Extract tasks.
   - Owner: only set owner if explicitly assigned in the transcript. If unassigned, set ownerStatus to "MISSING" and owner to empty string. If inferred, set ownerStatus to "SUGGESTED".
   - Deadline: if explicitly mentioned, extract it. If ambiguous, set deadlineStatus to "AMBIGUOUS".
   - Flag needsClarification as true for unassigned tasks or ambiguous deadlines.
   - Provide supporting transcript quote.
4. Risks & Blockers:
   - Identify operational risks, unresolved disagreements, missing info, potential project delays, dependencies, decisions without evidence.
   - CRITICAL: Distinguish between explicitly stated risks (isAiInferred: false) and AI-inferred potential risks (isAiInferred: true).
5. Open Questions:
   - List key unanswered questions that should be resolved before next meeting.
6. Transcript quotes:
   - Must be EXACT substrings from the transcript. Do not fabricate or hallucinate quotations!`;

    const prompt = `Please rigorously analyse the following meeting transcript according to your behavioural safeguards instructions:

Meeting Title: ${title || 'Project Meeting'}
Meeting Date: ${date || 'Recent'}
Participants: ${Array.isArray(participants) ? participants.join(', ') : 'Not specified'}

TRANSCRIPT:
${transcript}`;

    // Call Gemini with a 15-second timeout safeguard
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: 'Executive summary of no more than 100 words in British English',
            },
            decisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  statement: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    description: 'CONFIRMED, PROPOSED, or UNRESOLVED',
                  },
                  peopleInvolved: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  transcriptQuote: { type: Type.STRING },
                  uncertaintyExplanation: { type: Type.STRING },
                  managerApprovalRequired: { type: Type.BOOLEAN },
                },
                required: ['statement', 'status', 'peopleInvolved', 'transcriptQuote', 'managerApprovalRequired'],
              },
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  ownerStatus: {
                    type: Type.STRING,
                    description: 'CONFIRMED, SUGGESTED, or MISSING',
                  },
                  deadline: { type: Type.STRING },
                  deadlineStatus: {
                    type: Type.STRING,
                    description: 'CONFIRMED, AMBIGUOUS, or MISSING',
                  },
                  priority: {
                    type: Type.STRING,
                    description: 'HIGH, MEDIUM, or LOW',
                  },
                  transcriptQuote: { type: Type.STRING },
                  needsClarification: { type: Type.BOOLEAN },
                  clarificationReason: { type: Type.STRING },
                },
                required: ['task', 'ownerStatus', 'priority', 'transcriptQuote', 'needsClarification'],
              },
            },
            risks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  riskType: {
                    type: Type.STRING,
                    description: 'OPERATIONAL, DISAGREEMENT, MISSING_INFO, DELAY, DEPENDENCY, or EVIDENCE_GAP',
                  },
                  severity: {
                    type: Type.STRING,
                    description: 'HIGH, MEDIUM, or LOW',
                  },
                  isAiInferred: { type: Type.BOOLEAN },
                  transcriptQuote: { type: Type.STRING },
                  mitigationSuggestion: { type: Type.STRING },
                },
                required: ['title', 'description', 'riskType', 'severity', 'isAiInferred'],
              },
            },
            openQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  askedBy: { type: Type.STRING },
                  whyItMatters: { type: Type.STRING },
                },
                required: ['question', 'whyItMatters'],
              },
            },
          },
          required: ['executiveSummary', 'decisions', 'actions', 'risks', 'openQuestions'],
        },
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI analysis timed out after 12 seconds')), 12000)
    );

    const response: any = await Promise.race([generatePromise, timeoutPromise]);

    const rawText = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', rawText);
      return res.status(500).json({
        error: 'Failed to parse AI output into structured data.',
        raw: rawText,
      });
    }

    // Helper: verify if quote exists in transcript
    const verifyQuote = (quote?: string): boolean => {
      if (!quote || quote.trim().length < 5) return false;
      const cleanQuote = quote.replace(/^[^:]+:\s*/, '').trim().toLowerCase();
      return transcript.toLowerCase().includes(cleanQuote);
    };

    // Calculate reading metrics
    const wordCount = transcript.trim().split(/\s+/).length;
    const readingTimeOriginalMinutes = Math.round((wordCount / 240) * 10) / 10;
    const summaryWordCount = (parsedData.executiveSummary || '').split(/\s+/).length;
    const readingTimeSummaryMinutes = Math.max(0.3, Math.round((summaryWordCount / 240) * 10) / 10);
    const timeSavedMinutes = Math.max(0.5, Math.round((readingTimeOriginalMinutes - readingTimeSummaryMinutes) * 10) / 10);

    const enrichedAnalysis = {
      id: `mtg-${Date.now()}`,
      title: title || 'Untitled Meeting',
      date: date || new Date().toISOString().split('T')[0],
      participants: Array.isArray(participants) ? participants : [],
      transcript,
      executiveSummary: parsedData.executiveSummary || 'No summary generated.',
      decisions: (parsedData.decisions || []).map((d: any, idx: number) => ({
        id: `dec-${idx + 1}`,
        statement: d.statement,
        status: ['CONFIRMED', 'PROPOSED', 'UNRESOLVED'].includes(d.status) ? d.status : 'PROPOSED',
        peopleInvolved: d.peopleInvolved || [],
        transcriptQuote: d.transcriptQuote || '',
        uncertaintyExplanation: d.uncertaintyExplanation || '',
        managerApprovalRequired: Boolean(d.managerApprovalRequired || d.status !== 'CONFIRMED'),
        managerReviewed: false,
        managerConfirmed: d.status === 'CONFIRMED',
        evidenceVerified: verifyQuote(d.transcriptQuote),
      })),
      actions: (parsedData.actions || []).map((a: any, idx: number) => ({
        id: `act-${idx + 1}`,
        task: a.task,
        owner: a.owner || '',
        ownerStatus: ['CONFIRMED', 'SUGGESTED', 'MISSING'].includes(a.ownerStatus) ? a.ownerStatus : (a.owner ? 'SUGGESTED' : 'MISSING'),
        deadline: a.deadline || '',
        deadlineStatus: ['CONFIRMED', 'AMBIGUOUS', 'MISSING'].includes(a.deadlineStatus) ? a.deadlineStatus : (a.deadline ? 'AMBIGUOUS' : 'MISSING'),
        priority: ['HIGH', 'MEDIUM', 'LOW'].includes(a.priority) ? a.priority : 'MEDIUM',
        status: 'PENDING',
        transcriptQuote: a.transcriptQuote || '',
        needsClarification: Boolean(a.needsClarification || !a.owner || a.ownerStatus === 'MISSING'),
        clarificationReason: a.clarificationReason || (!a.owner ? 'No owner assigned in transcript' : ''),
        isManagerConfirmed: a.ownerStatus === 'CONFIRMED',
        evidenceVerified: verifyQuote(a.transcriptQuote),
      })),
      risks: (parsedData.risks || []).map((r: any, idx: number) => ({
        id: `risk-${idx + 1}`,
        title: r.title,
        description: r.description,
        riskType: r.riskType || 'OPERATIONAL',
        severity: ['HIGH', 'MEDIUM', 'LOW'].includes(r.severity) ? r.severity : 'MEDIUM',
        isAiInferred: Boolean(r.isAiInferred),
        transcriptQuote: r.transcriptQuote || '',
        mitigationSuggestion: r.mitigationSuggestion || '',
        isResolved: false,
        evidenceVerified: verifyQuote(r.transcriptQuote),
      })),
      openQuestions: (parsedData.openQuestions || []).map((q: any, idx: number) => ({
        id: `q-${idx + 1}`,
        question: q.question,
        askedBy: q.askedBy || '',
        whyItMatters: q.whyItMatters || '',
        answered: false,
      })),
      analyzedAt: new Date().toISOString(),
      isPrecomputedFallback: false,
      metrics: {
        wordCount,
        readingTimeOriginalMinutes,
        readingTimeSummaryMinutes,
        timeSavedMinutes,
      },
    };

    res.json(enrichedAnalysis);
  } catch (error: any) {
    console.error('Error analyzing meeting with Gemini:', error);
    res.status(500).json({
      error: error?.message || 'Server error during meeting analysis',
      fallbackAvailable: true,
    });
  }
});

// Vite or Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DecisionBrief server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
