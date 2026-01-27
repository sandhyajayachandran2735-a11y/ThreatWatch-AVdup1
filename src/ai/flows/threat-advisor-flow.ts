'use server';
/**
 * @fileOverview A conversational AI agent for providing threat analysis.
 *
 * - askThreatAdvisor - A function that provides responses to user queries about security threats.
 */

import { ai } from '@/ai/genkit';
import {
  AskThreatAdvisorInputSchema,
  AskThreatAdvisorOutputSchema,
  type AskThreatAdvisorInput,
  type AskThreatAdvisorOutput,
} from '@/ai/schemas/threat-advisor-schemas';

export async function askThreatAdvisor(input: AskThreatAdvisorInput): Promise<AskThreatAdvisorOutput> {
  return threatAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'threatAdvisorPrompt',
  input: { schema: AskThreatAdvisorInputSchema },
  output: { schema: AskThreatAdvisorOutputSchema },
  prompt: `You are an AV Cyber Threat Advisor.
Give concise responses in 3 short points only:
• Risk level
• Immediate action
• One-line recommendation.
Do not exceed 3 bullet points.

CURRENT THREAT CONTEXT:
- Sybil Alerts Detected: {{threatContext.sybilAlerts}}

CONVERSATION HISTORY:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the history and context, answer the user's latest message.
`,
});

const threatAdvisorFlow = ai.defineFlow(
  {
    name: 'threatAdvisorFlow',
    inputSchema: AskThreatAdvisorInputSchema,
    outputSchema: AskThreatAdvisorOutputSchema,
  },
  async (input) => {
    // For simple, direct conversations, we can just use the latest user message.
    // The prompt is already configured to see the whole history.
    const { output } = await prompt(input);
    return output!;
  }
);
