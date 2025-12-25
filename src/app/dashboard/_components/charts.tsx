// 'use client';

// import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   ChartLegend,
//   ChartLegendContent,
// } from '@/components/ui/chart';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// const gpsAnomaliesData = [
//   { time: '12:00', anomalies: 4 },
//   { time: '13:00', anomalies: 3 },
//   { time: '14:00', anomalies: 8 },
//   { time: '15:00', anomalies: 5 },
//   { time: '16:00', anomalies: 6 },
//   { time: '17:00', anomalies: 7 },
//   { time: '18:00', anomalies: 10 },
// ];

// const spoofingFrequencyData = [
//   { module: 'CAN Bus', frequency: 186 },
//   { module: 'GPS', frequency: 305 },
//   { module: 'LIDAR', frequency: 237 },
//   { module: 'IMU', frequency: 73 },
//   { module: 'Camera', frequency: 209 },
// ];

// const chartConfig = {
//   anomalies: {
//     label: 'Anomalies',
//     color: 'hsl(var(--primary))',
//   },
//   frequency: {
//     label: 'Frequency',
//     color: 'hsl(var(--accent))',
//   },
// };

// export function GpsAnomaliesChart() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold">GPS Signal Anomalies Over Time</CardTitle>
//         <CardDescription>Last 6 hours</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig} className="h-[250px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={gpsAnomaliesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//               <XAxis dataKey="time" />
//               <YAxis />
//               <ChartTooltip content={<ChartTooltipContent />} />
//               <Line type="monotone" dataKey="anomalies" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
//             </LineChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }

// export function SpoofingFrequencyChart() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold">Spoofing Frequency by Module</CardTitle>
//         <CardDescription>Breakdown of spoofing events by vehicle module.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig} className="h-[250px] w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={spoofingFrequencyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
//               <CartesianGrid strokeDasharray="3 3" vertical={false} />
//               <XAxis dataKey="module" tickLine={false} axisLine={false} />
//               <YAxis />
//               <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
//               <Bar dataKey="frequency" fill="hsl(var(--primary))" radius={4} />
//             </BarChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   );
// }
