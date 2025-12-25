import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const AskThreatAdvisorInputSchema = z.object({
  threatContext: z.object({
    sybilAlerts: z.number().describe('The current count of Sybil alerts.'),
  }),
  history: z.array(MessageSchema).describe('The conversation history between the user and the assistant.'),
});
export type AskThreatAdvisorInput = z.infer<typeof AskThreatAdvisorInputSchema>;

export const AskThreatAdvisorOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
});
export type AskThreatAdvisorOutput = z.infer<typeof AskThreatAdvisorOutputSchema>;
