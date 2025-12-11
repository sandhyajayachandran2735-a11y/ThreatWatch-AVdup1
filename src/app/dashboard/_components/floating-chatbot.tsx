'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare } from 'lucide-react';
import { ThreatAdvisorChatbot } from './threat-advisor-chatbot';

interface FloatingChatbotProps {
  threatContext: {
    sybilAlerts: number;
    gpsSpoofingEvents: number;
    sensorAnomalies: number;
  };
}

export function FloatingChatbot({ threatContext }: FloatingChatbotProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg" size="icon">
          <MessageSquare className="h-8 w-8" />
          <span className="sr-only">Open Threat Advisor</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] p-0 sm:w-[540px]">
        <ThreatAdvisorChatbot threatContext={threatContext} />
      </SheetContent>
    </Sheet>
  );
}
