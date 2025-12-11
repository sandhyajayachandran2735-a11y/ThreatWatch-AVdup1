'use server';
/**
 * @fileOverview A flow for generating a hero video for the landing page.
 *
 * - generateHeroVideo - A function that generates a video URL.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { MediaPart } from 'genkit';
import * as z from 'zod';
import * as fs from 'fs';
import { Readable } from 'stream';

// Helper function to download the video - this would be more robust in a real app
async function downloadVideo(video: MediaPart): Promise<string> {
    if (!video.media?.url) {
        throw new Error('Video URL not found');
    }
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }
    const videoDownloadResponse = await fetch(
        `${video.media.url}&key=${apiKey}`
    );

    if (!videoDownloadResponse.ok || !videoDownloadResponse.body) {
        throw new Error(`Failed to fetch video: ${videoDownloadResponse.statusText}`);
    }

    const buffer = await videoDownloadResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = video.media.contentType || 'video/mp4';

    return `data:${contentType};base64,${base64}`;
}


const generateHeroVideoFlow = ai.defineFlow(
  {
    name: 'generateHeroVideoFlow',
    inputSchema: z.void(),
    outputSchema: z.string(),
  },
  async () => {
    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: 'A cinematic, futuristic shot of an autonomous vehicle navigating a neon-lit city at night. Show the car from a dynamic side angle, with data overlays and light trails creating a sense of speed and technology.',
        config: {
          durationSeconds: 5,
          aspectRatio: '16:9',
        },
      });
    
      if (!operation) {
        throw new Error('Expected the model to return an operation');
      }
    
      // Wait until the operation completes.
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await ai.checkOperation(operation);
      }
    
      if (operation.error) {
        throw new Error('failed to generate video: ' + operation.error.message);
      }
    
      const video = operation.output?.message?.content.find((p) => !!p.media);
      if (!video) {
        throw new Error('Failed to find the generated video in the operation result');
      }

      const dataUrl = await downloadVideo(video);
      return dataUrl;
  }
);


export async function generateHeroVideo(): Promise<string> {
    return generateHeroVideoFlow();
}
