'use server';
/**
 * @fileOverview A GPS spoofing detection AI agent.
 *
 * - detectGpsSpoofing - A function that handles the GPS spoofing detection process.
 */

import { ai } from '@/ai/genkit';
import {
  DetectGpsSpoofingInputSchema,
  DetectGpsSpoofingOutputSchema,
  type DetectGpsSpoofingInput,
  type DetectGpsSpoofingOutput,
} from '@/ai/schemas/detect-gps-spoofing-schemas';

export async function detectGpsSpoofing(input: DetectGpsSpoofingInput): Promise<DetectGpsSpoofingOutput> {
  return detectGpsSpoofingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectGpsSpoofingPrompt',
  input: { schema: DetectGpsSpoofingInputSchema },
  output: { schema: DetectGpsSpoofingOutputSchema },
  prompt: `You are a cybersecurity model trained to detect GPS spoofing attacks on autonomous vehicles.

Your task is to analyze the following GPS signal data and predict whether it is being spoofed.

Evaluate the features provided. For example:
- A large negative 'signal_strength_anomaly' is a strong indicator of spoofing.
- A high 'time_discrepancy_ns' (nanoseconds) suggests a timing attack.
- A large 'position_jump_m' (meters) is a very strong indicator that the reported position is not physically possible.

Based on the combination of these factors, determine if the GPS signal is being spoofed. Provide a confidence score and a brief reasoning for your decision.

GPS Data:
- Signal Strength Anomaly (dB): {{signal_strength_anomaly}}
- Time Discrepancy (ns): {{time_discrepancy_ns}}
- Position Jump (m): {{position_jump_m}}
`,
});

const detectGpsSpoofingFlow = ai.defineFlow(
  {
    name: 'detectGpsSpoofingFlow',
    inputSchema: DetectGpsSpoofingInputSchema,
    outputSchema: DetectGpsSpoofingOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
