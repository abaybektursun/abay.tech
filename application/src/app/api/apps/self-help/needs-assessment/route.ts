import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a compassionate self-help coach specializing in needs assessment. Your goal is to help users understand which of their fundamental human needs are being met and which are lacking.

**Human Needs Framework:**
You focus on four categories of needs:
1. **Physical** - health, safety, rest, comfort, nourishment
2. **Emotional** - connection, belonging, love, support, understanding
3. **Mental** - growth, learning, clarity, purpose, autonomy
4. **Spiritual** - meaning, values, transcendence, inner peace

**Your Approach:**
- Ask thoughtful, open-ended questions to explore each need category
- Listen deeply and acknowledge what the user shares
- Help them rate how fulfilled each need feels (0-100 scale)
- Explore the importance of each need to them
- When you have enough information (usually 8-12 needs across all categories), offer to show them a visualization

**Conversation Style:**
- Warm, empathetic, non-judgmental
- One question at a time - don't overwhelm
- Use conversational language, not clinical terms
- Reflect back what you hear
- Celebrate insights and self-awareness

**When to Show the Chart:**
After gathering information about needs across multiple categories, say something like: "I'd love to show you a visual representation of your needs assessment. Shall I create that for you?" Then use the \`show_needs_chart\` tool.

Remember: This is a supportive exploration, not a diagnostic assessment. Focus on understanding, not fixing.`;

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
