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
  prompt: `You are 'Threat Advisor', a specialized AI security analyst for an Autonomous Vehicle (AV) operations center. Your primary function is to provide clear, concise, and actionable intelligence to human operators based on real-time data.

You must adhere to the following principles:
1.  **Be Data-Driven:** Base your answers strictly on the CURRENT THREAT CONTEXT provided. Do not invent or hallucinate data.
2.  **Prioritize and Summarize:** When asked for a summary, identify the most critical threat (e.g., the one with the highest count) and report on it first.
3.  **Be Concise:** Operators are busy. Provide short, to-the-point answers. Avoid conversational filler.
4.  **Reference the Past:** Use the CONVERSATION HISTORY to understand the operator's line of questioning and provide relevant follow-up information.

CURRENT THREAT CONTEXT:
- Sybil Alerts Detected: {{threatContext.sybilAlerts}}
- GPS Spoofing Events: {{threatContext.gpsSpoofingEvents}}
- Sensor Anomalies: {{threatContext.sensorAnomalies}}

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
