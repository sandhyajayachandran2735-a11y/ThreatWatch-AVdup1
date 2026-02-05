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
  prompt: `You are a security analyst specializing in autonomous vehicle threat detection.

  Based on the following threat intelligence signals from the fleet today, provide a prioritized summary of the most critical threats to vehicle safety. Highlight the most pressing issues that require immediate attention.

  - Sybil Alerts Today: {{sybilAlertsToday}}
  - Sensor Spoofing Alerts Today: {{sensorAlertsToday}}

  Analyze the risk based on these numbers. If both are high, warn of a coordinated multi-vector attack. If only one is active, explain the specific risk of that attack type (Sybil for network/identity disruption, Sensor for perception manipulation).

  {{#if additionalContext}}
  Additional Context: {{additionalContext}}
  {{/if}}
  `,
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
