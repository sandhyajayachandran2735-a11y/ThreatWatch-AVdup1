import { z } from 'zod';

export const DetectGpsSpoofingInputSchema = z.object({
  signal_strength_anomaly: z.number().describe('The deviation from expected GPS signal strength, in dB.'),
  time_discrepancy_ns: z.number().describe('The time discrepancy in nanoseconds compared to other timing sources.'),
  position_jump_m: z.number().describe('The sudden change in reported position in meters.'),
});
export type DetectGpsSpoofingInput = z.infer<typeof DetectGpsSpoofingInputSchema>;

export const DetectGpsSpoofingOutputSchema = z.object({
  isSpoofing: z.boolean().describe('Whether or not the GPS signal is predicted to be spoofed.'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the prediction (0 to 1).'),
  reasoning: z.string().describe('A brief explanation for the prediction.'),
});
export type DetectGpsSpoofingOutput = z.infer<typeof DetectGpsSpoofingOutputSchema>;
