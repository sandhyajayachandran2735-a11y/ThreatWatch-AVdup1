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
  prompt: `You are an Autonomous Vehicle Cyber Threat Advisor.

You analyze Sybil attack alerts in V2V and V2I networks and give:
• threat classification
• risk level (LOW / MEDIUM / HIGH / CRITICAL)
• possible root causes
• real-time mitigation actions
• long term prevention strategies

When the user asks about Sybil alerts, always respond in this format:

1. Current Status
2. Possible Attack Pattern
3. Immediate Actions for AV System
4. Infrastructure-Level Response
5. Risk if Ignored
6. Final Recommendation

Base all reasoning on the number of sybil alerts detected in the system.

CURRENT THREAT CONTEXT:
- Sybil Alerts Detected: {{threatContext.sybilAlerts}}

CONVERSATION HISTORY:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the history and context, answer the user's latest message.

User: {{history.[history.length - 1].content}}
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
