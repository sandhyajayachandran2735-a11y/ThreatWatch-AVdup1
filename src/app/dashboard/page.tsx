'use client';

import { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, ShieldAlert, Loader2, Map as MapIcon } from 'lucide-react';
import { AIThreatSummary } from './_components/ai-summary';
import { FloatingChatbot } from './_components/floating-chatbot';
import { ThreatTrendChart } from './_components/charts';
import { LiveMap } from './_components/live-map';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

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

  const threatEventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'threat_events'), orderBy('detectedAt', 'desc'));
  }, [firestore]);

  const { data: threatLogs, isLoading } = useCollection<ThreatEvent>(threatEventsQuery);

  const stats = useMemo(() => {
    if (!threatLogs) return { sybilMalicious: 0, sensorMalicious: 0, totalAlerts: 0, trendData: [] };
    
    const todayStart = startOfDay(new Date());

    // Aggregating 7-day trend
    const trendData = Array.from({ length: 7 }).map((_, i) => {
      const targetDate = subDays(todayStart, 6 - i);
      const dayLogs = threatLogs.filter(log => {
        if (!log.detectedAt) return false;
        return isSameDay(new Date(log.detectedAt.seconds * 1000), targetDate);
      });

      return {
        date: format(targetDate, 'MMM dd'),
        sybil: dayLogs.filter(log => log.threatType === 'Sybil' && log.details?.isMalicious === true).length,
        sensor: dayLogs.filter(log => log.threatType === 'Sensor Spoofing' && log.details?.action !== 'Normal Driving').length,
      };
    });

    // Today's stats
    const todayLogs = threatLogs.filter(log => {
      if (!log.detectedAt) return false;
      return isSameDay(new Date(log.detectedAt.seconds * 1000), todayStart);
    });

    const sybilMalicious = todayLogs.filter(log => 
      log.threatType === 'Sybil' && 
      log.details?.isMalicious === true
    ).length;

    const sensorMalicious = todayLogs.filter(log => 
      log.threatType === 'Sensor Spoofing' && 
      log.details?.action !== 'Normal Driving'
    ).length;

    return {
      sybilMalicious,
      sensorMalicious,
      totalAlerts: sybilMalicious + sensorMalicious,
      trendData
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ThreatTrendChart data={stats.trendData} />
        </div>
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-semibold">Live Fleet View</CardTitle>
            <MapIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] p-0 overflow-hidden relative">
            <LiveMap />
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
