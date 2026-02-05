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
import { Loader2, AlertCircle, ShieldAlert, Radar, Network } from 'lucide-react';
import { format } from 'date-fns';

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

export default function HistoryPage() {
  const firestore = useFirestore();

  const threatEventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'threat_events'), orderBy('detectedAt', 'desc'));
  }, [firestore]);

  const { data: threatLogs, isLoading, error } = useCollection<ThreatEvent>(threatEventsQuery);

  const formattedLogs = useMemo(() => {
    return threatLogs?.map(log => ({
      ...log,
      formattedTimestamp: log.detectedAt
        ? format(new Date(log.detectedAt.seconds * 1000), "yyyy-MM-dd HH:mm:ss")
        : 'Processing...',
      isMalicious: log.threatType === 'Sybil' 
        ? log.details.isMalicious 
        : log.details.action !== 'Normal Driving'
    }));
  }, [threatLogs]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
          <AlertCircle className="mb-2 h-8 w-8" />
          <p className="font-semibold">Failed to load threat history</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }

    if (!formattedLogs || formattedLogs.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 opacity-20" />
          <p className="text-lg font-medium">No threat history recorded.</p>
          <p className="text-sm">Run a detection on the Sybil or Sensor pages to see logs here.</p>
        </div>
      );
    }

    return (
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Threat Type</TableHead>
              <TableHead className="text-center">Severity</TableHead>
              <TableHead className="text-center">Confidence</TableHead>
              <TableHead className="text-center">Source</TableHead>
              <TableHead className="max-w-[300px]">Reasoning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">{log.formattedTimestamp}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {log.threatType === 'Sybil' ? <Network className="h-4 w-4 text-primary" /> : <Radar className="h-4 w-4 text-accent" />}
                        <span className="text-sm font-medium">{log.threatType}</span>
                    </div>
                </TableCell>
                <TableCell className="text-center">
                    <Badge variant={log.isMalicious ? 'destructive' : 'secondary'}>
                        {log.isMalicious ? 'Critical' : 'Safe'}
                    </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">
                    {(log.details.confidence * 100).toFixed(0)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-muted-foreground">{log.source}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground italic">
                    {log.details.reasoning}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold font-headline">Unified Threat History</h1>
        <p className="text-muted-foreground">
          A consolidated log of all Sybil and Sensor Spoofing analysis events.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}


// 'use client';

// import { useMemo } from 'react';
// import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
// import { collection, query, orderBy } from 'firebase/firestore';
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
// import { Loader2, AlertCircle } from 'lucide-react';
// import { format } from 'date-fns';

// type SybilAttackLog = {
//   id: string;
//   detectedAt: {
//     seconds: number;
//     nanoseconds: number;
//   } | null;
//   sybilNodeCount: number;
//   riskScore: number;
//   nodes: {
//     vehicleId: string;
//     confidence: string;
//   }[];
// };

// export default function HistoryPage() {
//   const firestore = useFirestore();

//   const sybilAttacksQuery = useMemoFirebase(() => {
//     if (!firestore) return null;
//     return query(collection(firestore, 'sybil_attacks'), orderBy('detectedAt', 'desc'));
//   }, [firestore]);

//   const { data: attackLogs, isLoading, error } = useCollection<SybilAttackLog>(sybilAttacksQuery);

//   const formattedLogs = useMemo(() => {
//     return attackLogs?.map(log => ({
//       ...log,
//       formattedTimestamp: log.detectedAt
//         ? format(new Date(log.detectedAt.seconds * 1000), "yyyy-MM-dd HH:mm:ss")
//         : 'Pending...',
//     }));
//   }, [attackLogs]);

//   const renderContent = () => {
//     if (isLoading) {
//       return (
//         <div className="flex items-center justify-center p-8">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
//           <AlertCircle className="mb-2 h-8 w-8" />
//           <p className="font-semibold">Failed to load history</p>
//           <p className="text-sm">{error.message}</p>
//         </div>
//       );
//     }

//     if (!formattedLogs || formattedLogs.length === 0) {
//       return (
//         <div className="py-8 text-center text-muted-foreground">
//           <p>No Sybil attack analysis history found.</p>
//           <p className="text-sm">Run a detection on the Sybil Detection page to see logs here.</p>
//         </div>
//       );
//     }

//     return (
//       <div className="w-full overflow-x-auto rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[200px]">Timestamp</TableHead>
//               <TableHead className="text-center">Result</TableHead>
//               <TableHead className="text-center">Risk Score</TableHead>
//               <TableHead className="text-center">Sybil Nodes</TableHead>
//               <TableHead>Involved Nodes</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {formattedLogs.map((log) => (
//               <TableRow key={log.id}>
//                 <TableCell className="font-mono text-sm">{log.formattedTimestamp}</TableCell>
//                 <TableCell className="text-center">
//                     <Badge variant={log.sybilNodeCount > 0 ? 'destructive' : 'secondary'}>
//                         {log.sybilNodeCount > 0 ? 'Malicious' : 'Benign'}
//                     </Badge>
//                 </TableCell>
//                 <TableCell className="text-center">
//                   <Badge variant={log.riskScore > 75 ? 'destructive' : log.riskScore > 40 ? 'secondary' : 'default'}>
//                     {log.riskScore.toFixed(0)}%
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-center font-semibold">{log.sybilNodeCount}</TableCell>
//                 <TableCell>
//                     {log.nodes.map((node, index) => (
//                         <span key={index} className="mr-2">
//                             {node.vehicleId} ({node.confidence})
//                         </span>
//                     ))}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     );
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-2xl font-semibold font-headline">Sybil Attack Analysis History</CardTitle>
//         <CardDescription>
//           A log of all Sybil attack detection analyses that have been performed.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {renderContent()}
//       </CardContent>
//     </Card>
//   );
// }


// // 'use client';

// // import { useMemo } from 'react';
// // import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
// // import { collection, query, orderBy } from 'firebase/firestore';
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from '@/components/ui/card';
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from '@/components/ui/table';
// // import { Badge } from '@/components/ui/badge';
// // import { Loader2, AlertCircle } from 'lucide-react';
// // import { format } from 'date-fns';

// // type SybilAttackLog = {
// //   id: string;
// //   detectedAt: {
// //     seconds: number;
// //     nanoseconds: number;
// //   } | null;
// //   sybilNodeCount: number;
// //   riskScore: number;
// //   nodes: {
// //     vehicleId: string;
// //     confidence: string;
// //   }[];
// // };

// // export default function HistoryPage() {
// //   const firestore = useFirestore();

// //   const sybilAttacksQuery = useMemoFirebase(() => {
// //     if (!firestore) return null;
// //     return query(collection(firestore, 'sybil_attacks'), orderBy('detectedAt', 'desc'));
// //   }, [firestore]);

// //   const { data: attackLogs, isLoading, error } = useCollection<SybilAttackLog>(sybilAttacksQuery);

// //   const formattedLogs = useMemo(() => {
// //     return attackLogs?.map(log => ({
// //       ...log,
// //       formattedTimestamp: log.detectedAt
// //         ? format(new Date(log.detectedAt.seconds * 1000), "yyyy-MM-dd HH:mm:ss")
// //         : 'Pending...',
// //     }));
// //   }, [attackLogs]);

// //   const renderContent = () => {
// //     if (isLoading) {
// //       return (
// //         <div className="flex items-center justify-center p-8">
// //           <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //         </div>
// //       );
// //     }

// //     if (error) {
// //       return (
// //         <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
// //           <AlertCircle className="mb-2 h-8 w-8" />
// //           <p className="font-semibold">Failed to load history</p>
// //           <p className="text-sm">{error.message}</p>
// //         </div>
// //       );
// //     }

// //     if (!formattedLogs || formattedLogs.length === 0) {
// //       return (
// //         <div className="py-8 text-center text-muted-foreground">
// //           <p>No Sybil attack analysis history found.</p>
// //           <p className="text-sm">Run a detection on the Sybil Detection page to see logs here.</p>
// //         </div>
// //       );
// //     }

// //     return (
// //       <div className="w-full overflow-x-auto rounded-md border">
// //         <Table>
// //           <TableHeader>
// //             <TableRow>
// //               <TableHead className="w-[200px]">Timestamp</TableHead>
// //               <TableHead className="text-center">Result</TableHead>
// //               <TableHead className="text-center">Risk Score</TableHead>
// //               <TableHead className="text-center">Sybil Nodes</TableHead>
// //               <TableHead>Involved Nodes</TableHead>
// //             </TableRow>
// //           </TableHeader>
// //           <TableBody>
// //             {formattedLogs.map((log) => (
// //               <TableRow key={log.id}>
// //                 <TableCell className="font-mono text-sm">{log.formattedTimestamp}</TableCell>
// //                 <TableCell className="text-center">
// //                     <Badge variant={log.sybilNodeCount > 0 ? 'destructive' : 'secondary'}>
// //                         {log.sybilNodeCount > 0 ? 'Malicious' : 'Benign'}
// //                     </Badge>
// //                 </TableCell>
// //                 <TableCell className="text-center">
// //                   <Badge variant={log.riskScore > 75 ? 'destructive' : log.riskScore > 40 ? 'secondary' : 'default'}>
// //                     {log.riskScore.toFixed(0)}%
// //                   </Badge>
// //                 </TableCell>
// //                 <TableCell className="text-center font-semibold">{log.sybilNodeCount}</TableCell>
// //                 <TableCell>
// //                     {log.nodes.map((node, index) => (
// //                         <span key={index} className="mr-2">
// //                             {node.vehicleId} ({node.confidence})
// //                         </span>
// //                     ))}
// //                 </TableCell>
// //               </TableRow>
// //             ))}
// //           </TableBody>
// //         </Table>
// //       </div>
// //     );
// //   };

// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle className="text-2xl font-semibold font-headline">Sybil Attack Analysis History</CardTitle>
// //         <CardDescription>
// //           A log of all Sybil attack detection analyses that have been performed.
// //         </CardDescription>
// //       </CardHeader>
// //       <CardContent>
// //         {renderContent()}
// //       </CardContent>
// //     </Card>
// //   );
// // }
// 'use client';

// import { useMemo } from 'react';
// import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
// import { collection, query, orderBy } from 'firebase/firestore';
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
// import { Loader2, AlertCircle } from 'lucide-react';
// import { format } from 'date-fns';

// type SybilAttackLog = {
//   id: string;
//   detectedAt: {
//     seconds: number;
//     nanoseconds: number;
//   } | null;
//   sybilNodeCount: number;
//   riskScore: number;
//   nodes: {
//     vehicleId: string;
//     confidence: string;
//   }[];
// };

// export default function HistoryPage() {
//   const firestore = useFirestore();

//   const sybilAttacksQuery = useMemoFirebase(() => {
//     if (!firestore) return null;
//     return query(collection(firestore, 'sybil_attacks'), orderBy('detectedAt', 'desc'));
//   }, [firestore]);

//   const { data: attackLogs, isLoading, error } = useCollection<SybilAttackLog>(sybilAttacksQuery);

//   const formattedLogs = useMemo(() => {
//     return attackLogs?.map(log => ({
//       ...log,
//       formattedTimestamp: log.detectedAt
//         ? format(new Date(log.detectedAt.seconds * 1000), "yyyy-MM-dd HH:mm:ss")
//         : 'Pending...',
//     }));
//   }, [attackLogs]);

//   const renderContent = () => {
//     if (isLoading) {
//       return (
//         <div className="flex items-center justify-center p-8">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       );
//     }

//     if (error) {
//       return (
//         <div className="flex flex-col items-center justify-center p-8 text-center text-destructive">
//           <AlertCircle className="mb-2 h-8 w-8" />
//           <p className="font-semibold">Failed to load history</p>
//           <p className="text-sm">{error.message}</p>
//         </div>
//       );
//     }

//     if (!formattedLogs || formattedLogs.length === 0) {
//       return (
//         <div className="py-8 text-center text-muted-foreground">
//           <p>No Sybil attack analysis history found.</p>
//           <p className="text-sm">Run a detection on the Sybil Detection page to see logs here.</p>
//         </div>
//       );
//     }

//     return (
//       <div className="w-full overflow-x-auto rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-[200px]">Timestamp</TableHead>
//               <TableHead className="text-center">Result</TableHead>
//               <TableHead className="text-center">Risk Score</TableHead>
//               <TableHead className="text-center">Sybil Nodes</TableHead>
//               <TableHead>Involved Nodes</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {formattedLogs.map((log) => (
//               <TableRow key={log.id}>
//                 <TableCell className="font-mono text-sm">{log.formattedTimestamp}</TableCell>
//                 <TableCell className="text-center">
//                     <Badge variant={log.sybilNodeCount > 0 ? 'destructive' : 'secondary'}>
//                         {log.sybilNodeCount > 0 ? 'Malicious' : 'Benign'}
//                     </Badge>
//                 </TableCell>
//                 <TableCell className="text-center">
//                   <Badge variant={log.riskScore > 75 ? 'destructive' : log.riskScore > 40 ? 'secondary' : 'default'}>
//                     {log.riskScore.toFixed(0)}%
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="text-center font-semibold">{log.sybilNodeCount}</TableCell>
//                 <TableCell>
//                     {log.nodes.map((node, index) => (
//                         <span key={index} className="mr-2">
//                             {node.vehicleId} ({node.confidence})
//                         </span>
//                     ))}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     );
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="text-2xl font-semibold font-headline">Sybil Attack Analysis History</CardTitle>
//         <CardDescription>
//           A log of all Sybil attack detection analyses that have been performed.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {renderContent()}
//       </CardContent>
//     </Card>
//   );
// }

