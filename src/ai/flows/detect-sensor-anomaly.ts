'use server';
/**
 * @fileOverview A sensor anomaly detection AI agent.
 *
 * - detectSensorAnomaly - A function that handles the sensor anomaly detection process.
 */

import { ai } from '@/ai/genkit';
import {
  DetectSensorAnomalyInputSchema,
  DetectSensorAnomalyOutputSchema,
  type DetectSensorAnomalyInput,
  type DetectSensorAnomalyOutput,
} from '@/ai/schemas/detect-sensor-anomaly-schemas';

export async function detectSensorAnomaly(input: DetectSensorAnomalyInput): Promise<DetectSensorAnomalyOutput> {
  return detectSensorAnomalyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectSensorAnomalyPrompt',
  input: { schema: DetectSensorAnomalyInputSchema },
  output: { schema: DetectSensorAnomalyOutputSchema },
  prompt: `You are a cybersecurity model trained to detect sensor anomalies in autonomous vehicles.

Your task is to analyze the following sensor data and predict whether it represents an anomaly (e.g., from spoofing or malfunction).

Evaluate the features provided. For example:
- A 'reading' that falls outside the 'expected_range_min' and 'expected_range_max' is a strong indicator of an anomaly.
- A 'redundancy_check_ok' value of 0 (false) means other sensors do not corroborate this reading, which is highly suspicious.
- A very low 'time_since_last_reading_ms' might indicate a replay attack, while a very high value could indicate a sensor failure.

Based on the combination of these factors, determine if the sensor reading is an anomaly.

If an anomaly:
1. Provide a clear, non-technical reasoning.
2. Provide 3-5 immediate technical mitigation steps (e.g., 'Switch to redundant sensor', 'Initiate sensor self-calibration', 'Isolate affected data stream').

If normal:
1. Provide reasoning why the reading is safe.
2. Provide 3-5 routine checkup steps.

Sensor Data:
- Sensor Type: {{sensor_type}}
- Reading: {{reading}}
- Redundancy Check OK (1 for true, 0 for false): {{redundancy_check_ok}}
- Time Since Last Reading (ms): {{time_since_last_reading_ms}}
- Expected Range (Min): {{expected_range_min}}
- Expected Range (Max): {{expected_range_max}}
`,
});

const detectSensorAnomalyFlow = ai.defineFlow(
  {
    name: 'detectSensorAnomalyFlow',
    inputSchema: DetectSensorAnomalyInputSchema,
    outputSchema: DetectSensorAnomalyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
