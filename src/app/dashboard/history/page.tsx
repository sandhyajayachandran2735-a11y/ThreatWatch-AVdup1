'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';

type DetectionLog = {
  id: string;
  detectedAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
  type: 'Sybil' | 'Sensor Spoofing';
  result: string;
  confidence: number;
  details: string;
};

export default function HistoryPage() {
  const firestore = useFirestore();

  const detectionLogsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'detection_logs'), orderBy('detectedAt', 'desc'));
  }, [firestore]);

  const { data: logs, isLoading, error } = useCollection<DetectionLog>(detectionLogsQuery);

  const formattedLogs = useMemo(() => {
    return logs?.map(log => ({
      ...log,
      formattedTimestamp: log.detectedAt
        ? format(new Date(log.detectedAt.seconds * 1000), "yyyy-MM-dd HH:mm:ss")
        : 'Pending...',
    }));
  }, [logs]);

  const getResultBadgeVariant = (log: DetectionLog): 'destructive' | 'secondary' | 'default' => {
      if (log.type === 'Sybil') {
          return log.result === 'Malicious' ? 'destructive' : 'secondary';
      }
      if (log.type === 'Sensor Spoofing') {
          return log.result === 'Normal Driving' ? 'secondary' : 'destructive';
      }
      return 'default';
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
          <AlertCircle className="mb-2 h-8 w-8" />
          <p className="font-semibold">Failed to load history</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }

    if (!formattedLogs || formattedLogs.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <p>No detection history found.</p>
          <p className="text-sm">Run a detection on the Sybil or Sensor Spoofing pages to see logs here.</p>
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Timestamp</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-center">Confidence</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">{log.formattedTimestamp}</TableCell>
                <TableCell>
                    <Badge variant={log.type === 'Sybil' ? 'default' : 'outline'}>{log.type}</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={getResultBadgeVariant(log)}>
                        {log.result}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={log.confidence > 75 ? 'destructive' : log.confidence > 40 ? 'secondary' : 'default'}>
                    {log.confidence.toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold font-headline flex items-center gap-2">
            <HistoryIcon />
            Detection History
        </CardTitle>
        <CardDescription>
          A log of all Sybil attack and Sensor Spoofing analyses that have been performed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
