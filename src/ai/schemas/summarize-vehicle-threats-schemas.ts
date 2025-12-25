import { z } from 'zod';

export const SummarizeVehicleThreatsInputSchema = z.object({
  sybilAlertsToday: z.number().describe('The number of sybil alerts today.'),
  // gpsSpoofingEvents: z.number().describe('The number of GPS spoofing events detected.'),
  // sensorSpoofingFlags: z.number().describe('The number of sensor spoofing flags raised.'),
  additionalContext: z.string().optional().describe('Additional context or information to consider in the summary.'),
});
export type SummarizeVehicleThreatsInput = z.infer<typeof SummarizeVehicleThreatsInputSchema>;

export const SummarizeVehicleThreatsOutputSchema = z.object({
  summary: z.string().describe('A prioritized summary of the most critical threats to vehicle safety.'),
});
export type SummarizeVehicleThreatsOutput = z.infer<typeof SummarizeVehicleThreatsOutputSchema>;
