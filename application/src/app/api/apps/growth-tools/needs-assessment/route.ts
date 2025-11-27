import { openai } from '@ai-sdk/openai';
import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Load the system prompt from the markdown file
const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), 'src/app/api/apps/growth-tools/needs-assessment/prompt.md'),
  'utf-8'
);

export async function POST(req: Request) {

  if (!process.env.OPENAI_API_KEY) {
    console.error(
      '[NeedsAssessmentAPI] OPENAI_API_KEY is not configured. Unable to fulfil request.'
    );
    return Response.json(
      {
        error:
          'AI assistant is unavailable because the OpenAI API key is missing. Please contact the administrator.',
      },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    // Convert UIMessage[] to ModelMessage[] for streamText
    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools: {
        show_needs_chart: tool({
          description:
            "Display a visualization of the user's needs assessment. Use this when you have gathered enough information about their needs across different categories.",
          inputSchema: z.object({
            needs: z
              .array(
                z.object({
                  category: z.enum(['physical', 'emotional', 'mental', 'spiritual']),
                  name: z.string().describe('Specific need (e.g., "rest", "connection", "purpose")'),
                  fulfilled: z.number().min(0).max(100).describe('How fulfilled this need is (0-100)'),
                  importance: z
                    .number()
                    .min(0)
                    .max(100)
                    .describe('How important this need is to the user (0-100)'),
                })
              )
              .describe('Array of needs identified during the conversation'),
            insights: z.array(z.string()).describe('Key insights or patterns you noticed (2-4 brief observations)'),
          }),
          execute: async (input) => input,
        }),
        hide_chart: tool({
          description:
            'Hide the needs visualization and return to full chat view. Use this when the user wants to dismiss the chart or continue the conversation without the visual.',
          inputSchema: z.object({}),
          execute: async () => ({}),
        }),
        request_slider: tool({
          description:
            'Request numeric ratings from the user via interactive sliders. Use this when you need the user to rate one or more things on a scale (e.g., how fulfilled they feel across different areas). Each field has its own slider with a name/title.',
          inputSchema: z.object({
            question: z.string().describe('The overall question or prompt (e.g., "Rate how fulfilled you feel in these areas:")'),
            fields: z.array(z.object({
              name: z.string().describe('Name/title for this slider (e.g., "Work", "Relationships", "Health")'),
              min: z.number().optional().default(0).describe('Minimum value (default: 0)'),
              max: z.number().optional().default(100).describe('Maximum value (default: 100)'),
              step: z.number().optional().default(1).describe('Step increment (default: 1)'),
              defaultValue: z.number().optional().describe('Initial slider value'),
              labels: z.array(z.string()).length(2).optional().describe('Labels for min/max ends'),
            })).describe('Array of slider fields to display'),
          }),
          execute: async (input) => input,
        }),
      },
      // Correct, documented way to catch streaming errors
      onError: (error) => {
        console.error("[NeedsAssessmentAPI] A streaming error occurred:", error);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error('[NeedsAssessmentAPI] Failed to process chat request', error);
    return Response.json(
      {
        error: 'We were unable to process your request. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
