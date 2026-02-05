import { z } from 'zod';

export const DetectSybilAttackInputSchema = z.object({
  position_x: z.number().describe('The x-coordinate of the vehicle.'),
  position_y: z.number().describe('The y-coordinate of the vehicle.'),
  speed: z.number().describe('The speed of the vehicle.'),
  direction: z.number().describe('The direction of the vehicle in degrees.'),
  acceleration: z.number().describe('The acceleration of the vehicle.'),
  signal_strength: z.number().describe("The signal strength of the vehicle's communication."),
  trust_score: z.number().min(0).max(1).describe('A pre-calculated trust score for the vehicle.'),
  sybil_attack_attempts: z.number().int().describe('The number of recent suspected Sybil attack attempts associated with this vehicle.'),
});
export type DetectSybilAttackInput = z.infer<typeof DetectSybilAttackInputSchema>;

export const DetectSybilAttackOutputSchema = z.object({
  isMalicious: z.boolean().describe('Whether or not the vehicle is predicted to be a malicious (Sybil) node.'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the prediction (0 to 1).'),
  reasoning: z.string().describe('A brief explanation for the prediction.'),
  mitigationSteps: z.array(z.string()).describe('A list of 3-5 recommended technical actions to mitigate the detected threat or maintain safety.'),
});
export type DetectSybilAttackOutput = z.infer<typeof DetectSybilAttackOutputSchema>;
