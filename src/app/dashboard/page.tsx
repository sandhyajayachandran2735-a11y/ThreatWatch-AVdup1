'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { AIThreatSummary } from './_components/ai-summary';
import { FloatingChatbot } from './_components/floating-chatbot';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

type ThreatEvent = {
  id: string;
  detectedAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
  threatType: 'Sybil' | 'Sensor Spoofing';
  riskScore: number;
  source: 'Manual' | 'CSV';
  details: {
    isMalicious?: boolean;
    action?: string;
    confidence: number;
    reasoning: string;
  };
  detectedEntities: string;
};

export default function DashboardPage() {
  const firestore = useFirestore();

  // Create a memoized query for all threat events ordered by timestamp
  const threatEventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'threat_events'), orderBy('detectedAt', 'desc'));
  }, [firestore]);

  // Use the useCollection hook to get real-time data from Firestore
  const { data: threatLogs, isLoading } = useCollection<ThreatEvent>(threatEventsQuery);

  // Calculate stats based on the fetched logs for today
  const stats = useMemo(() => {
    if (!threatLogs) return { sybilMalicious: 0, sensorMalicious: 0, totalAlerts: 0 };
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Filter logs for today
    const todayLogs = threatLogs.filter(log => {
      if (!log.detectedAt) return false;
      const logDate = new Date(log.detectedAt.seconds * 1000);
      return logDate >= todayStart;
    });

    // Count malicious Sybil attacks for today
    const sybilMalicious = todayLogs.filter(log => 
      log.threatType === 'Sybil' && 
      log.details?.isMalicious === true
    ).length;

    // Count malicious Sensor Spoofing flags for today
    const sensorMalicious = todayLogs.filter(log => 
      log.threatType === 'Sensor Spoofing' && 
      log.details?.action !== 'Normal Driving'
    ).length;

    return {
      sybilMalicious,
      sensorMalicious,
      totalAlerts: sybilMalicious + sensorMalicious
    };
  }, [threatLogs]);

  const threatContext = {
    sybilAlerts: stats.sybilMalicious,
  };

  return (
    <div className="relative flex-1 space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sybil Alerts Today</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-2xl font-bold opacity-50">...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats.sybilMalicious}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GPS Spoofing Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Releasing soon...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensor Spoofing Flags</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-2xl font-bold opacity-50">...</span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-foreground">{stats.sensorMalicious}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <AIThreatSummary
        sybilAlertsToday={stats.totalAlerts}
      />
      
      <FloatingChatbot threatContext={threatContext} />
    </div>
  );
}
