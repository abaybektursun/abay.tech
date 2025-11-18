import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
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

    const result = streamText({
      model: openai('gpt-4o'),
      system: SYSTEM_PROMPT,
      messages,
      experimental_toolCallStreaming: true, // Enable tool call streaming
      tools: {
        show_needs_chart: tool({
          description:
            "Display a visualization of the user's needs assessment. Use this when you have gathered enough information about their needs across different categories.",
          parameters: z
            .object({
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
            })
            .describe('Payload for rendering the visualization'),
          // No execute function - this will be handled client-side
        }),
        hide_chart: tool({
          description:
            'Hide the needs visualization and return to full chat view. Use this when the user wants to dismiss the chart or continue the conversation without the visual.',
          parameters: z.object({}),
          // No execute function - this will be handled client-side
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[NeedsAssessmentAPI] Failed to process chat request', error);
    return Response.json(
      {
        error: 'We were unable to process your request. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
