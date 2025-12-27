'use client';

import {
  Card,
  CardContent,
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
// import { GpsAnomaliesChart, SpoofingFrequencyChart } from './_components/charts';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AIThreatSummary } from './_components/ai-summary';
import { LiveMap } from './_components/live-map';
import { FloatingChatbot } from './_components/floating-chatbot';

const metrics = {
  sybilAlerts: 14,
  gpsSpoofing:2,
  sensorFlags:3

 };

// const alerts = [
//   { message: 'Sybil node 0xAB1 detected with 95% confidence.', severity: 'danger' },
//   { message: 'Potential GPS spoofing detected near downtown area.', severity: 'warning' },
//   { message: 'Unusual CAN bus traffic from node 0x1F3.', severity: 'warning' },
//   { message: 'Sybil node 0xCD2 detected with 88% confidence.', severity: 'danger' },
//   { message: 'LIDAR sensor data mismatch on vehicle #A48B.', severity: 'warning' },
//   { message: 'All systems nominal.', severity: 'safe' },
// ];

// const severityConfig = {
//   danger: { label: 'Danger', className: 'bg-destructive text-destructive-foreground hover:bg-destructive/80' },
//   warning: { label: 'Warning', className: 'bg-warning text-warning-foreground hover:bg-warning/80' },
//   safe: { label: 'Safe', className: 'bg-success text-success-foreground hover:bg-success/80' },
// };

export default function DashboardPage() {
  const threatContext = {
    sybilAlerts: metrics.sybilAlerts,
  };

  return (
    <div className="relative flex-1 space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sybil Alerts Today</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sybilAlerts}</div>
              <p className="text-xs text-muted-foreground">+2 since last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GPS Spoofing Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* <div className="text-2xl font-bold">{metrics.gpsSpoofing}</div> */}
              <p className="text-xs text-muted-foreground">Releasing soon....</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sensor Spoofing Flags</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sensorFlags}</div>
              <p className="text-xs text-muted-foreground">Releasing soon...</p>
            </CardContent>
          </Card>
        </div>

          {/* AI Summary */}
        <AIThreatSummary
          sybilAlertsToday={metrics.sybilAlerts}
        />
        
        


        {/* Live Map and Alerts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Live GPS Route Map</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <LiveMap />
                 </div>
              </CardContent>
            </Card>
            {/* <Card> */}
              {/* <CardHeader>
                <CardTitle className="text-xl font-semibold">Live Alerts</CardTitle>
              </CardHeader> */}
              {/* <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alert</TableHead>
                      <TableHead className="text-right">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{alert.message}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={severityConfig[alert.severity as keyof typeof severityConfig].className}>
                            {severityConfig[alert.severity as keyof typeof severityConfig].label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card> */}
          </div>
      <FloatingChatbot threatContext={threatContext} />
    </div>
  );
}
