import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-vehicle-threats.ts';
import '@/ai/flows/detect-sybil-attack.ts';
import '@/ai/flows/threat-advisor-flow.ts';
import '@/ai/flows/detect-gps-spoofing.ts';
import '@/ai/flows/detect-sensor-anomaly.ts';
