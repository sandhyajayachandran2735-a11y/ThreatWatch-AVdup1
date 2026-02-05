'use server';
/**
 * @fileOverview A Sybil attack detection AI agent.
 *
 * - detectSybilAttack - A function that handles the Sybil attack detection process.
 */

import { ai } from '@/ai/genkit';
import {
  DetectSybilAttackInputSchema,
  DetectSybilAttackOutputSchema,
  type DetectSybilAttackInput,
  type DetectSybilAttackOutput,
} from '@/ai/schemas/detect-sybil-attack-schemas';

export async function detectSybilAttack(input: DetectSybilAttackInput): Promise<DetectSybilAttackOutput> {
  return detectSybilAttackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSybilAttackPrompt',
  input: { schema: DetectSybilAttackInputSchema },
  output: { schema: DetectSybilAttackOutputSchema },
  prompt: `You are a cybersecurity expert specializing in Vehicular Ad-hoc Networks (VANETs).

Your task is to analyze the following vehicle data and predict whether it is a malicious Sybil node.

Evaluate the features provided. For example:
- High 'sybil_attack_attempts' is a strong indicator of maliciousness.
- A very low 'trust_score' (e.g., < 0.1) is also a strong indicator.
- Unusually high 'acceleration' or erratic 'direction' changes can be suspicious.
- 'signal_strength' that is unusually high or low for its position might indicate spoofing.

Based on the combination of these factors, determine if the node is malicious. 

If malicious:
1. Provide a clear, non-technical reasoning.
2. Provide 3-5 immediate technical mitigation steps (e.g., 'Isolate Vehicle ID 0x4F', 'Update V2X trust certificates', 'Initiate identity re-verification').

If benign:
1. Provide a clear reasoning why it's safe.
2. Provide 3-5 maintenance steps for ongoing monitoring.

Vehicle Data:
- Position X: {{position_x}}
- Position Y: {{position_y}}
- Speed: {{speed}}
- Direction: {{direction}}
- Acceleration: {{acceleration}}
- Signal Strength: {{signal_strength}}
- Trust Score: {{trust_score}}
- Sybil Attack Attempts: {{sybil_attack_attempts}}
`,
});

const detectSybilAttackFlow = ai.defineFlow(
  {
    name: 'detectSybilAttackFlow',
    inputSchema: DetectSybilAttackInputSchema,
    outputSchema: DetectSybilAttackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
