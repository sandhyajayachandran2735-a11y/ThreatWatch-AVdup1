'use server';
/**
 * @fileOverview A conversational AI agent for providing threat analysis.
 *
 * - askThreatAdvisor - A function that provides responses to user queries about security threats.
 */

import { ai } from '@/ai/genkit';
import {
  AskThreatAdvisorInputSchema,
  AskThreatAdvisorOutputSchema,
  type AskThreatAdvisorInput,
  type AskThreatAdvisorOutput,
} from '@/ai/schemas/threat-advisor-schemas';

export async function askThreatAdvisor(input: AskThreatAdvisorInput): Promise<AskThreatAdvisorOutput> {
  return threatAdvisorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'threatAdvisorPrompt',
  input: { schema: AskThreatAdvisorInputSchema },
  output: { schema: AskThreatAdvisorOutputSchema },
  prompt: `You are "Threat Advisor", an intelligent security assistant specialized in Sybil Attack education for Autonomous Vehicle networks.

Your primary mission is to teach the user about Sybil attacks using a strict multi-step pedagogical structure.

STEP 1: IDENTIFICATION & TYPES
Explain that a Sybil attack uses fake identities to gain disproportionate influence.
Detail the following types:
- Direct: Malicious nodes communicate directly with legitimate nodes.
- Indirect: Malicious nodes use a relay node to mask their presence.
- Simultaneous: All identities attack at once.
- Non-Simultaneous: Identities are cycled to appear as a moving fleet.

STEP 2: VEHICULAR IMPACT
Explain how these attacks specifically affect VANETs (Vehicular Ad-hoc Networks):
- Phantom Traffic: Creating fake congestion to reroute real vehicles.
- Routing Disruption: Dropping or misdirecting safety messages.
- Resource Exhaustion: Flooding the network with fake authentication requests.

STEP 3: OUR DETECTION LOGIC (BEHAVIOR-BASED)
Explain that our system uses behavior-based detection rather than just static certificates:
- Kinematic Consistency: Checking if multiple IDs move in impossible synchrony.
- Signal Overlap: Detecting if different IDs share identical signal strength profiles.
- Trust Decay: Monitoring identity reputation over time.

RESPONSE STYLE:
- Professional, educational, and structured.
- Use bullet points for attack types.
- If dashboard data shows Sybil alerts ({{threatContext.sybilAlerts}}), use it as a real-world example of one of the types above.

CONVERSATION HISTORY:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Latest Message: {{{history.last.content}}}
`,
});

const threatAdvisorFlow = ai.defineFlow(
  {
    name: 'threatAdvisorFlow',
    inputSchema: AskThreatAdvisorInputSchema,
    outputSchema: AskThreatAdvisorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
