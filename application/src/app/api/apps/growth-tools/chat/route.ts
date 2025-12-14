import { openai } from '@ai-sdk/openai';
import { streamText, tool, convertToModelMessages, stepCountIs, createIdGenerator } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { checkTokenLimit, recordTokenUsage } from '@/lib/rate-limit';
import { getExercise } from '@/lib/growth-tools/exercises';
import { findRelevantChunks } from '@/lib/growth-tools/rag';
import { auth } from '@/auth';
import { saveChat } from '@/lib/actions';

export const maxDuration = 30;

const PROMPTS_DIR = path.join(process.cwd(), 'src/app/api/apps/growth-tools/prompts');

/**
 * Load and concatenate prompt files for an exercise
 */
function loadSystemPrompt(promptFiles: string[]): string {
  return promptFiles
    .map(file => {
      const filePath = path.join(PROMPTS_DIR, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`[Chat] Prompt file not found: ${filePath}`);
        return '';
      }
      return fs.readFileSync(filePath, 'utf-8');
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}

/**
 * Build tools object based on exercise config
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTools(toolNames: string[]): Record<string, any> {
  const allTools = {
    request_slider: tool({
      description:
        'Request numeric ratings from the user via interactive sliders. Use this when you need the user to rate one or more things on a scale.',
      inputSchema: z.object({
        question: z.string().describe('The overall question or prompt'),
        fields: z.array(
          z.object({
            name: z.string().describe('Name/title for this slider'),
            min: z.number().optional().default(0),
            max: z.number().optional().default(100),
            step: z.number().optional().default(1),
            defaultValue: z.number().optional(),
            labels: z.array(z.string()).length(2).optional(),
          })
        ),
      }),
      execute: async (input) => input,
    }),
    show_life_wheel: tool({
      description:
        "Display a Life Wheel visualization showing the user's fulfillment across Tony Robbins' 6 Human Needs. Use this when you have gathered scores (0-10) for the six needs during the assessment.",
      inputSchema: z.object({
        areas: z
          .array(
            z.object({
              category: z.enum([
                'certainty',
                'variety',
                'significance',
                'connection',
                'growth',
                'contribution',
              ]),
              label: z.string().describe('Human-readable label (e.g., "Certainty", "Growth")'),
              score: z.number().min(0).max(10).describe('Fulfillment score for this need (0-10)'),
            })
          )
          .describe('Array of the 6 human needs with fulfillment scores'),
        insights: z.array(z.string()).describe('Key insights about their needs fulfillment (2-4 observations)'),
        overallScore: z.number().min(0).max(10).optional().describe('Overall fulfillment score'),
      }),
      execute: async (input) => input,
    }),
  };

  // Return only the tools this exercise needs
  const exerciseTools: Record<string, (typeof allTools)[keyof typeof allTools]> = {};
  for (const name of toolNames) {
    if (allTools[name as keyof typeof allTools]) {
      exerciseTools[name] = allTools[name as keyof typeof allTools];
    }
  }
  return exerciseTools;
}

export async function POST(req: Request) {
  const limit = await checkTokenLimit();
  if (!limit.success) {
    return Response.json(
      { error: `Token limit exceeded (${limit.limit}). Please try again later.` },
      { status: 429 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[Chat] OPENAI_API_KEY is not configured.');
    return Response.json(
      { error: 'AI assistant is unavailable. Please contact the administrator.' },
      { status: 500 }
    );
  }

  // Get user session for persistence
  const session = await auth();
  const userId = session?.user?.email || session?.user?.id || null;
  console.log('[Chat] Session userId:', userId ? 'authenticated' : 'anonymous');

  const { exercise: exerciseId, id: chatId, messages } = await req.json();
  console.log('[Chat] Request:', { exerciseId, chatId, messageCount: messages?.length });

  // Get exercise config
  const exerciseConfig = getExercise(exerciseId);
  if (!exerciseConfig) {
    return Response.json({ error: `Unknown exercise: ${exerciseId}` }, { status: 400 });
  }

  const modelMessages = convertToModelMessages(messages);

  // Load system prompt
  let systemPrompt = loadSystemPrompt(exerciseConfig.prompt);

  // If exercise has RAG, search and inject context
  if (exerciseConfig.ragFolder) {
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const userQuery = lastUserMessage?.parts?.find((p: any) => p.type === 'text')?.text || '';

    if (userQuery) {
      console.log(`[Chat/${exerciseId}] RAG search:`, userQuery);
      const results = await findRelevantChunks(exerciseConfig.ragFolder, userQuery, 4);
      console.log(
        `[Chat/${exerciseId}] RAG results:`,
        results.map(r => ({ source: r.source, score: r.score.toFixed(3) }))
      );

      if (results.length > 0) {
        const ragContext = results
          .map(r => `## From ${r.source} (relevance: ${(r.score * 100).toFixed(0)}%)\n${r.content}`)
          .join('\n\n');

        systemPrompt += `\n\n---\n\n# Relevant Context from Knowledge Base\n\nUse these stories and concepts naturally if they're relevant. Don't force them — only weave them in if they fit:\n\n${ragContext}`;
      }
    }
  }

  // Build tools for this exercise
  const tools = buildTools(exerciseConfig.tools);
  const hasTools = Object.keys(tools).length > 0;

  const result = streamText({
    model: openai('gpt-5.2-chat-latest'),
    system: systemPrompt,
    messages: modelMessages,
    ...(hasTools && {
      tools,
      stopWhen: stepCountIs(3),
    }),
    onError: (error) => {
      console.error(`[Chat/${exerciseId}] Streaming error:`, error);
    },
  });

  result.usage.then(usage => {
    if (usage.totalTokens) {
      recordTokenUsage(usage.totalTokens);
    }
  });

  // Consume stream server-side to ensure onFinish fires even if client disconnects.
  // This prevents data loss when users close the browser mid-conversation.
  // See: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence
  result.consumeStream();

  // Use onFinish callback for server-side persistence with complete UIMessage[]
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: 'msg', size: 16 }),
    onFinish: async ({ messages: finalMessages }) => {
      // Log detailed message structure for debugging
      console.log('[Chat] onFinish triggered');
      console.log('[Chat] Final messages count:', finalMessages.length);

      // Log each message's parts structure
      finalMessages.forEach((msg, idx) => {
        const partTypes = msg.parts.map(p => p.type);
        console.log(`[Chat] Message ${idx} (${msg.role}):`, {
          id: msg.id,
          partsCount: msg.parts.length,
          partTypes,
        });
      });

      // Only save for authenticated users
      if (userId && chatId) {
        console.log('[Chat] Saving chat to DB:', { chatId, userId: 'redacted', messageCount: finalMessages.length });
        try {
          await saveChat({
            id: chatId,
            messages: finalMessages,
            userId,
          });
          console.log('[Chat] Chat saved successfully');
        } catch (error) {
          console.error('[Chat] Failed to save chat:', error);
        }
      } else {
        console.log('[Chat] Skipping save - anonymous user or no chatId');
      }
    },
  });
}
