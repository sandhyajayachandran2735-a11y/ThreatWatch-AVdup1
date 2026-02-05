import { z } from 'zod';

export const DetectSensorAnomalyInputSchema = z.object({
    sensor_type: z.enum(["LIDAR", "RADAR", "CAMERA", "IMU", "GPS"]).describe('The type of the sensor being analyzed.'),
    reading: z.number().describe('The raw value from the sensor.'),
    redundancy_check_ok: z.number().min(0).max(1).describe('1 if the reading is consistent with other sensors, 0 otherwise.'),
    time_since_last_reading_ms: z.number().describe('Time in milliseconds since the last valid reading from this sensor.'),
    expected_range_min: z.number().describe('The minimum value expected for a normal reading.'),
    expected_range_max: z.number().describe('The maximum value expected for a normal reading.'),
});
export type DetectSensorAnomalyInput = z.infer<typeof DetectSensorAnomalyInputSchema>;


export const DetectSensorAnomalyOutputSchema = z.object({
  isAnomaly: z.boolean().describe('Whether or not the sensor reading is predicted to be an anomaly.'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the prediction (0 to 1).'),
  reasoning: z.string().describe('A brief explanation for the prediction.'),
  mitigationSteps: z.array(z.string()).describe('A list of 3-5 recommended technical actions to mitigate the detected anomaly or maintain sensor health.'),
});
export type DetectSensorAnomalyOutput = z.infer<typeof DetectSensorAnomalyOutputSchema>;
