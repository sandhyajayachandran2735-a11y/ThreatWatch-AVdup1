// @/app/actions.ts
'use server';

import {
  summarizeVehicleThreats,
  type SummarizeVehicleThreatsInput,
} from '@/ai/flows/summarize-vehicle-threats';
import { generateHeroVideo } from '@/ai/flows/generate-hero-video';
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

export async function getHeroVideo(): Promise<{ videoUrl?: string; error?: string }> {
  try {
    const result = await generateHeroVideo();
    return { videoUrl: result };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate video.' };
  }
}
