'use server';

/**
 * @fileOverview A threat intelligence summarization AI agent.
 *
 * - summarizeVehicleThreats - A function that summarizes vehicle threats.
 */

import { ai } from '@/ai/genkit';
import {
  SummarizeVehicleThreatsInputSchema,
  SummarizeVehicleThreatsOutputSchema,
  type SummarizeVehicleThreatsInput,
  type SummarizeVehicleThreatsOutput,
} from '@/ai/schemas/summarize-vehicle-threats-schemas';


export async function summarizeVehicleThreats(input: SummarizeVehicleThreatsInput): Promise<SummarizeVehicleThreatsOutput> {
  return summarizeVehicleThreatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeVehicleThreatsPrompt',
  input: { schema: SummarizeVehicleThreatsInputSchema },
  output: { schema: SummarizeVehicleThreatsOutputSchema },
  prompt: `You are an AI Risk Assessment engine for an Autonomous Vehicle threat detection system.

Analyze the provided dashboard data and generate a prioritized summary.

RULES:
- Plain text only.
- No markdown (no bold, no italics, no lists).
- Maximum 120 words.
- If sybilAlertsToday and sensorAlertsToday are both 0, you MUST say exactly: "System stable. No active threats detected."

OUTPUT FORMAT:
Highest Priority Threat: <Name>
Risk Level: <Low/Medium/High>
Impact: <Short explanation>
Recommended Actions: <2-3 mitigation steps>

DATA:
- Sybil Alerts Today: {{sybilAlertsToday}}
- Sensor Spoofing Alerts Today: {{sensorAlertsToday}}
{{#if additionalContext}}
- Context: {{additionalContext}}
{{/if}}

Focus only on the most critical detected attack.`,
});

const summarizeVehicleThreatsFlow = ai.defineFlow(
  {
    name: 'summarizeVehicleThreatsFlow',
    inputSchema: SummarizeVehicleThreatsInputSchema,
    outputSchema: SummarizeVehicleThreatsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
