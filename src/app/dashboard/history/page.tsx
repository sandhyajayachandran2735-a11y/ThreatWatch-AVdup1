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
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

type SybilAttackLog = {
  id: string;
  detectedAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
  sybilNodeCount: number;
  riskScore: number;
  nodes: {
    vehicleId: string;
    confidence: string;
  }[];
};

export default function HistoryPage() {
  const firestore = useFirestore();

  const sybilAttacksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'sybil_attacks'), orderBy('detectedAt', 'desc'));
  }, [firestore]);

  const { data: attackLogs, isLoading, error } = useCollection<SybilAttackLog>(sybilAttacksQuery);

  const formattedLogs = useMemo(() => {
    return attackLogs?.map(log => ({
      ...log,
      formattedTimestamp: log.detectedAt
        ? format(new Date(log.detectedAt.seconds * 1000), "yyyy-MM-dd HH:mm:ss")
        : 'Pending...',
    }));
  }, [attackLogs]);

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
          <p>No Sybil attack analysis history found.</p>
          <p className="text-sm">Run a detection on the Sybil Detection page to see logs here.</p>
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Timestamp</TableHead>
              <TableHead className="text-center">Risk Score</TableHead>
              <TableHead className="text-center">Sybil Nodes</TableHead>
              <TableHead>Involved Nodes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-sm">{log.formattedTimestamp}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={log.riskScore > 75 ? 'destructive' : log.riskScore > 40 ? 'secondary' : 'default'}>
                    {log.riskScore.toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-semibold">{log.sybilNodeCount}</TableCell>
                <TableCell>
                    {log.nodes.map((node, index) => (
                        <span key={index} className="mr-2">
                            {node.vehicleId} ({node.confidence})
                        </span>
                    ))}
                </TableCell>
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
        <CardTitle className="text-2xl font-semibold font-headline">Sybil Attack Analysis History</CardTitle>
        <CardDescription>
          A log of all Sybil attack detection analyses that have been performed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
