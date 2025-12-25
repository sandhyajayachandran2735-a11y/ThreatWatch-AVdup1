'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAISummary } from '@/app/actions';
import { Loader2, Sparkles } from 'lucide-react';

interface AIThreatSummaryProps {
  sybilAlertsToday: number;
}

export function AIThreatSummary({
  sybilAlertsToday,
}: AIThreatSummaryProps) {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');
    const result = await getAISummary({
      sybilAlertsToday,
     });
    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.summary) {
      setSummary(result.summary);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="text-primary" />
          AI Risk Assessment
        </CardTitle>
        <CardDescription>
          Generate a prioritized summary of the most critical threats using GenAI.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px]">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : summary ? (
          <p className="text-sm">{summary}</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Click the button to generate a threat summary.</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateSummary} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
      </CardFooter>
    </Card>
  );
}
