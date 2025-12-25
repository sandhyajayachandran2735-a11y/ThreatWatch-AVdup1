'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare, Bot } from 'lucide-react';
import { ThreatAdvisorChatbot } from './threat-advisor-chatbot';

interface FloatingChatbotProps {
  threatContext: {
    sybilAlerts: number;
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
      <SheetContent className="w-[400px] p-0 sm:w-[540px] flex flex-col">
         <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2 text-xl font-semibold">
            <Bot />
            Threat Advisor
          </SheetTitle>
          <SheetDescription>
            Ask questions about the current threats and get AI-powered advice.
          </SheetDescription>
        </SheetHeader>
        <ThreatAdvisorChatbot threatContext={threatContext} />
      </SheetContent>
    </Sheet>
  );
}
