// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';

// const logs = [
//   { timestamp: '2024-05-21 14:45:10', module: 'GPS', message: 'Signal strength anomaly detected: -15.2 dB', severity: 'warning' },
//   { timestamp: '2024-05-21 14:45:05', module: 'CAN', message: 'Node 0x1F3 sending malformed packets', severity: 'warning' },
//   { timestamp: '2024-05-21 14:44:58', module: 'SYSTEM', message: 'Switched to inertial navigation backup', severity: 'info' },
//   { timestamp: '2024-05-21 14:43:20', module: 'LIDAR', message: 'Point cloud density below threshold', severity: 'warning' },
//   { timestamp: '2024-05-21 14:42:00', module: 'AUTH', message: 'Login successful for user: analyst', severity: 'info' },
//   { timestamp: '2024-05-21 14:41:15', module: 'NAV', message: 'Route recalculated due to traffic', severity: 'info' },
//   { timestamp: '2024-05-21 14:40:01', module: 'SYSTEM', message: 'Critical Threat: GPS spoofing probability > 80%', severity: 'danger' },
// ];

// const severityConfig = {
//   danger: { label: 'Danger', className: 'bg-destructive text-destructive-foreground' },
//   warning: { label: 'Warning', className: 'bg-warning text-warning-foreground' },
//   info: { label: 'Info', className: 'bg-secondary text-secondary-foreground' },
// };

// export default function LogsPage() {
  // return (
    // <Card>
      {/* <CardHeader>
        <CardTitle className="text-2xl font-semibold font-headline">System Logs</CardTitle>
        {/* <CardDescription>
          A live feed of all system events and alerts.
        </CardDescription> */}
      // </CardHeader> */}
      // <CardContent>
        {/* <div className="w-full overflow-x-auto rounded-md border"> */}
          {/* <Table> */}
            {/* <TableHeader className="sticky top-0 bg-background"> */}
              {/* <TableRow>
                <TableHead className="w-[200px]">Timestamp</TableHead>
                <TableHead className="w-[150px]">Module</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[120px] text-right">Severity</TableHead>
              </TableRow> */}
            {/* </TableHeader> */}
            {/* <TableBody> */}
              {/* {logs.map((log, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.module}</Badge>
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell className="text-right"> */}
                    {/* <Badge className={severityConfig[log.severity as keyof typeof severityConfig]?.className ?? ''}>
                      {severityConfig[log.severity as keyof typeof severityConfig]?.label ?? 'Unknown'}
                    </Badge> */}
                  {/* </TableCell>
                </TableRow> */}
              {/* ))} */}
            {/* </TableBody>
          </Table>
        // </div>
      </CardContent>
    </Card> */}
  // );
// }
