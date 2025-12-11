// @/app/actions.ts
'use server';

import {
  summarizeVehicleThreats,
} from '@/ai/flows/summarize-vehicle-threats';
import {
    type SummarizeVehicleThreatsInput,
    SummarizeVehicleThreatsInputSchema,
} from '@/ai/schemas/summarize-vehicle-threats-schemas'
import {
  detectSybilAttack,
} from '@/ai/flows/detect-sybil-attack';
import {
  type DetectSybilAttackInput,
  type DetectSybilAttackOutput,
  DetectSybilAttackInputSchema,
} from '@/ai/schemas/detect-sybil-attack-schemas';
import {
  askThreatAdvisor,
} from '@/ai/flows/threat-advisor-flow';
import {
  type AskThreatAdvisorInput,
  AskThreatAdvisorInputSchema,
} from '@/ai/schemas/threat-advisor-schemas';
import { z } from 'zod';

const AISummarySchema = z.object({
  sybilAlertsToday: z.coerce.number(),
  gpsSpoofingEvents: z.coerce.number(),
  sensorSpoofingFlags: z.coerce.number(),
  additionalContext: z.string().optional(),
});

export async function getAISummary(
  input: SummarizeVehicleThreatsInput
): Promise<{ summary?: string; error?: string }> {
  const parsed = AISummarySchema.safeParse(input);

  if (!parsed.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await summarizeVehicleThreats(parsed.data);
    return { summary: result.summary };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate summary.' };
  }
}

export async function getSybilAttackPrediction(
  input: DetectSybilAttackInput
): Promise<{ result?: DetectSybilAttackOutput; error?: string }> {
  const parsed = DetectSybilAttackInputSchema.safeParse(input);

  if (!parsed.success) {
    console.error(parsed.error);
    return { error: 'Invalid input.' };
  }

  try {
    const result = await detectSybilAttack(parsed.data);
    return { result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get prediction.' };
  }
}


export async function getThreatAdvice(
  input: AskThreatAdvisorInput
): Promise<{ response?: string; error?: string }> {
  const parsed = AskThreatAdvisorInputSchema.safeParse(input);
  if (!parsed.success) {
    console.error(parsed.error);
    return { error: 'Invalid input provided to threat advisor.' };
  }
  try {
    const result = await askThreatAdvisor(parsed.data);
    return { response: result.response };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get advice from the Threat Advisor.' };
  }
}
