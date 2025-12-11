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
import { GpsAnomaliesChart, SpoofingFrequencyChart } from './_components/charts';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AIThreatSummary } from './_components/ai-summary';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const metrics = {
  sybilAlerts: 14,
  gpsSpoofing: 3,
  sensorFlags: 8,
};

const alerts = [
  { message: 'Potential GPS spoofing detected near downtown area.', severity: 'danger' },
  { message: 'Unusual CAN bus traffic from node 0x1F3.', severity: 'warning' },
  { message: 'LIDAR sensor data mismatch on vehicle #A48B.', severity: 'warning' },
  { message: 'All systems nominal.', severity: 'safe' },
];

const severityConfig = {
  danger: { label: 'Danger', className: 'bg-destructive text-destructive-foreground hover:bg-destructive/80' },
  warning: { label: 'Warning', className: 'bg-warning text-warning-foreground hover:bg-warning/80' },
  safe: { label: 'Safe', className: 'bg-success text-success-foreground hover:bg-success/80' },
};

export default function DashboardPage() {
    const dashboardMap = PlaceHolderImages.find(p => p.id === 'dashboard-map');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Metrics Row */}
      <div className="col-span-1 grid gap-6 md:grid-cols-3 lg:col-span-12">
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
            <div className="text-2xl font-bold">{metrics.gpsSpoofing}</div>
            <p className="text-xs text-muted-foreground">High confidence events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensor Spoofing Flags</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sensorFlags}</div>
            <p className="text-xs text-muted-foreground">Anomalies detected</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      <div className="col-span-1 lg:col-span-12">
        <AIThreatSummary
          sybilAlertsToday={metrics.sybilAlerts}
          gpsSpoofingEvents={metrics.gpsSpoofing}
          sensorSpoofingFlags={metrics.sensorFlags}
        />
      </div>

      {/* Charts Section */}
      <div className="col-span-1 lg:col-span-7">
        <GpsAnomaliesChart />
      </div>
      <div className="col-span-1 lg:col-span-5">
        <SpoofingFrequencyChart />
      </div>

      {/* Live Map and Alerts */}
      <div className="col-span-1 lg:col-span-6">
        <Card className="bg-green-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-black">Live GPS Route Map</CardTitle>
          </CardHeader>
          <CardContent>
             {dashboardMap && (
                <div className="aspect-video overflow-hidden rounded-md">
                   <Image
                    src={dashboardMap.imageUrl}
                    alt={dashboardMap.description}
                    width={800}
                    height={450}
                    className="h-full w-full object-cover"
                    data-ai-hint={dashboardMap.imageHint}
                  />
                </div>
              )}
          </CardContent>
        </Card>
      </div>
      <div className="col-span-1 lg:col-span-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
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
        </Card>
      </div>
    </div>
  );
}
