// 'use client';

// import { useState } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator';
// import { AlertCircle, CheckCircle, Loader2, ShieldQuestion, UploadCloud } from 'lucide-react';
// import { Gauge } from '@/components/gauge';
// import { useToast } from '@/hooks/use-toast';
// import {
//   DetectSybilAttackInputSchema,
//   type DetectSybilAttackInput,
//   type DetectSybilAttackOutput,
// } from '@/ai/schemas/detect-sybil-attack-schemas';

// // Sample data for easy testing
// const sampleData = {
//   a: { position_x: 156.0186, position_y: 869.6497, speed: 14.29872, direction: 66.80889, acceleration: -0.10746, signal_strength: -92.9876, trust_score: 0.282821, sybil_attack_attempts: 2},
//   b: { position_x: 181.825, position_y: 211.7459, speed: 15.09628, direction: 312.24444, acceleration: -0.94809, signal_strength: -53.4068, trust_score: 0.95, sybil_attack_attempts: 0},
//   c: { position_x: 374.5401, position_y: 393.6355, speed: 11.20922, direction: 179.8813, acceleration: 1.37999, signal_strength: -74.8686, trust_score: 0.733277, sybil_attack_attempts: 1},
// };


// export default function SybilDetectionPage() {
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);
//   const [prediction, setPrediction] = useState<{isMalicious: boolean, confidence: number, reasoning: string} | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [fileName, setFileName] = useState<string | null>(null);
//   const [csvData, setCsvData] = useState<DetectSybilAttackInput | null>(null);


//   const { control, handleSubmit, reset, setValue } = useForm<DetectSybilAttackInput>({
//     resolver: zodResolver(DetectSybilAttackInputSchema),
//     defaultValues: sampleData.a,
//   });

//   const handleRunDetection = async (data: DetectSybilAttackInput) => {
//     setIsLoading(true);
//     setPrediction(null);
//     setError(null);

//     try {
//       const backendUrl = 'http://localhost:8000/predict';
//       const features = Object.values(data); // Convert data object to a list of feature values

//       const response = await fetch(backendUrl, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ features }),
//       });

//       if (!response.ok) {
//         throw new Error(`Backend server error: ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       if (result.error) {
//         throw new Error(result.error);
//       }
      
//       // Adapt the Python backend result to the frontend's expected format
//       const isMalicious = result.prediction === 1;
//       setPrediction({
//           isMalicious: isMalicious,
//           confidence: isMalicious ? 0.95 : 0.05, // Placeholder confidence
//           reasoning: isMalicious ? 'Prediction from custom Python model indicates malicious activity.' : 'Prediction from custom Python model indicates benign activity.',
//       });

//       toast({
//         title: 'Prediction Complete',
//         description: 'Received prediction from your Python backend.',
//       });

//     } catch (e: any) {
//       setError(e.message || 'Failed to get prediction from backend.');
//       console.error(e);
//       toast({
//         variant: 'destructive',
//         title: 'Backend Error',
//         description: `Could not connect to the Python backend. Is it running on port 8000? Details: ${e.message}`,
//       });
//     }

//     setIsLoading(false);
//   };

//   const loadSample = (sample: 'a' | 'b' | 'c') => {
//     reset(sampleData[sample]);
//     setPrediction(null);
//     setError(null);
//     setCsvData(null);
//     setFileName(null);
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) {
//       return;
//     }
//     setFileName(file.name);
//     setCsvData(null);
//     setPrediction(null);
//     setError(null);


//     const reader = new FileReader();
//     reader.onload = (e) => {
//       try {
//         const text = e.target?.result as string;
//         const lines = text.split('\n');
//         const headers = lines[0].split(',').map(h => h.trim());
//         const data = lines[1].split(',').map(d => parseFloat(d.trim()));

//         const dataObject: { [key: string]: number } = {};
//         headers.forEach((header, index) => {
//           if (Object.keys(sampleData.a).includes(header)) {
//             dataObject[header] = data[index];
//           }
//         });
      
//         const parsedData = DetectSybilAttackInputSchema.safeParse(dataObject);
//         if (parsedData.success) {
//           reset(parsedData.data);
//           setCsvData(parsedData.data);
//         } else {
//             setError("CSV file format is incorrect or doesn't contain required columns.");
//             console.error(parsedData.error);
//         }
//       } catch (e) {
//         setError(e instanceof Error ? e.message : "Failed to parse CSV file.");
//         console.error(e);
//       }
//     };
//     reader.readAsText(file);
//   };


//   return (
//     <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//       <div className="flex flex-col gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl font-semibold">Upload Vehicle Data CSV</CardTitle>
//             <CardDescription>
//               Submit a CSV file for Sybil attack analysis. The first data row will be used.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
//               <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
//               <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
//                 Choose a file
//               </Label>
//               <p className="mt-1 text-sm text-muted-foreground">{fileName || 'or drag and drop'}</p>
//               <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
//             </div>
//           </CardContent>
//           <CardFooter>
//              <Button 
//                 onClick={() => csvData && handleRunDetection(csvData)} 
//                 disabled={!csvData || isLoading}
//                 className="w-full"
//               >
//                   {isLoading && csvData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                   Run CSV Analysis
//               </Button>
//           </CardFooter>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl font-semibold">Run Sybil Attack Detection Manually</CardTitle>
//             <CardDescription>
//               Enter vehicle data to analyze for Sybil attack patterns or load a sample.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="mb-4 flex gap-2">
//               <Button variant="outline" size="sm" onClick={() => loadSample('a')}>Sample A (Malicious)</Button>
//               <Button variant="outline" size="sm" onClick={() => loadSample('b')}>Sample B (Benign)</Button>
//               <Button variant="outline" size="sm" onClick={() => loadSample('c')}>Sample C (Benign)</Button>
//             </div>
//             <form onSubmit={handleSubmit(handleRunDetection)} className="grid grid-cols-2 gap-4">
//               {(Object.keys(sampleData.a) as Array<keyof DetectSybilAttackInput>).map((key) => (
//                   <div key={key} className="space-y-2">
//                       <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
//                       <Controller
//                           name={key}
//                           control={control}
//                           render={({ field }) => (
//                               <Input {...field} id={key} type="number" step="any" onChange={e => field.onChange(e.target.valueAsNumber)} />
//                           )}
//                       />
//                   </div>
//               ))}
//               <div className="col-span-2">
//                   <Button type="submit" className="w-full" disabled={isLoading}>
//                       {isLoading && !csvData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                       Run Manual Detection
//                   </Button>
//               </div>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold">Custom Model Prediction</CardTitle>
//           <CardDescription>Real-time analysis from your Python model.</CardDescription>
//         </CardHeader>
//         <CardContent className="min-h-[300px] flex items-center justify-center">
//         {isLoading ? (
//             <Loader2 className="h-12 w-12 animate-spin text-primary" />
//         ) : error ? (
//             <div className="text-center text-destructive flex flex-col items-center gap-2">
//                 <AlertCircle className="h-10 w-10" />
//                 <p className="font-semibold">Error</p>
//                 <p className="text-sm">{error}</p>
//             </div>
//         ) : prediction ? (
//           <div className="w-full space-y-6">
//             <div className="flex flex-col items-center justify-around gap-6 sm:flex-row">
//                  <div className="text-center">
//                     <p className="text-sm font-medium text-muted-foreground">Result</p>
//                     {prediction.isMalicious ? (
//                         <div className="flex items-center gap-2 text-2xl font-bold text-destructive">
//                             <AlertCircle />
//                             <span>Malicious</span>
//                         </div>
//                     ) : (
//                          <div className="flex items-center gap-2 text-2xl font-bold text-success">
//                             <CheckCircle />
//                             <span>Benign</span>
//                         </div>
//                     )}
//                  </div>
//                  <div className="flex flex-col items-center">
//                    <Gauge value={Math.round(prediction.confidence * 100)} label="Confidence" />
//                 </div>
//             </div>
//             <Separator />
//             <div>
//                 <h3 className="font-medium mb-2">Reasoning</h3>
//                 <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{prediction.reasoning}</p>
//             </div>
//           </div>
//         ) : (
//            <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
//                 <ShieldQuestion className="h-10 w-10" />
//                 <p>Submit vehicle data to see the prediction from your Python model.</p>
//             </div>
//         )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Loader2, UploadCloud } from 'lucide-react';
import { Gauge } from '@/components/gauge';
import { useToast } from '@/hooks/use-toast';
import SpoofingCard from "../sybil-detection/spoofing.tsx";
import SensorSpoofingCard from "../sybil-detection/sensor_spoofing.tsx";


/* ---------------- SCHEMA ---------------- */

const DetectSybilAttackInputSchema = z.object({
  position_x: z.number(),
  position_y: z.number(),
  speed: z.number(),
  direction: z.number(),
  acceleration: z.number(),
  signal_strength: z.number(),
  trust_score: z.number(),
  sybil_attack_attempts: z.number(),
});

type DetectSybilAttackInput = z.infer<typeof DetectSybilAttackInputSchema>;

/* ---------------- SAMPLE DATA ---------------- */

const sampleData = {
  a: {
    position_x: 156.0186,
    position_y: 869.6497,
    speed: 14.29872,
    direction: 66.80889,
    acceleration: -0.10746,
    signal_strength: -92.9876,
    trust_score: 0.282821,
    sybil_attack_attempts: 2,
  },
};

/* ---------------- COMPONENT ---------------- */

export default function SybilDetectionPage() {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<{
    isMalicious: boolean;
    confidence: number;
    reasoning: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { control, handleSubmit, reset } = useForm<DetectSybilAttackInput>({
    resolver: zodResolver(DetectSybilAttackInputSchema),
    // defaultValues: sampleData.a,
  });

  /* ---------------- MANUAL PREDICTION ---------------- */

  const handleRunDetection = async (data: DetectSybilAttackInput) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('https://sybil-backend.onrender.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: Object.values(data) }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();

      const isMalicious = result.prediction === 1;

      setPrediction({
        isMalicious,
        confidence: result.confidence ?? 0.5,
        reasoning: isMalicious
          ? 'Random Forest detected Sybil behavior.'
          : 'Random Forest detected benign behavior.',
      });

      toast({
        title: 'Prediction successful',
        description: 'Result received from backend',
      });
    } catch (e: any) {
      setError(e.message);
    }

    setIsLoading(false);
  };

  /* ---------------- CSV UPLOAD ---------------- */

  const handleCsvUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://sybil-backend.onrender.com/predict-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      const isMalicious = result.prediction === 1;

      setPrediction({
        isMalicious,
        confidence: result.confidence ?? 0.5,
        reasoning: isMalicious
          ? 'Random Forest detected Sybil behavior from CSV.'
          : 'Random Forest detected benign behavior from CSV.',
      });
    } catch (e: any) {
      setError(e.message);
    }

    setIsLoading(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-6">
        {/* CSV CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV</CardTitle>
            <CardDescription>Upload vehicle data CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 flex-col items-center justify-center border-2 border-dashed rounded-lg">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCsvUpload} disabled={!file || isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Predict from CSV
            </Button>
          </CardFooter>
        </Card>

        {/* MANUAL CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Input</CardTitle>
            <CardDescription>Enter feature values</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRunDetection)} className="grid grid-cols-2 gap-4">
              {Object.keys(sampleData.a).map((key) => (
                <div key={key}>
                  <Label>{key.replace(/_/g, ' ')}</Label>
                  <Controller
                    name={key as keyof DetectSybilAttackInput}
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="any"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    )}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Predict
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <SpoofingCard /> 
       
     
         </div>
      


      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Prediction Result</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[780px]">
          {isLoading ? (
            <Loader2 className="h-10 w-10 animate-spin" />
          ) : error ? (
            <div className="text-destructive text-center">
              <AlertCircle className="mx-auto mb-2" />
              {error}
            </div>
          ) : prediction ? (
            <div className="text-center space-y-4">
              {prediction.isMalicious ? (
                <div className="text-destructive text-2xl flex items-center justify-center gap-2">
                  <AlertCircle /> Malicious
                </div>
              ) : (
                <div className="text-green-600 text-2xl flex items-center justify-center gap-2">
                  <CheckCircle /> Benign
                </div>
              )}
              <Gauge value={Math.round(prediction.confidence * 100)} label="Confidence" />
              <Separator />
              <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Submit data to get prediction</p>
          )}
        </CardContent>
      </Card>
      <SensorSpoofingCard/>
    </div>
    </div>
  );
}
// import React from "react";

// export default function SpoofingCard() {
//   return (
//     <div className="bg-gray-300 w-1/2 mx-auto p-6 rounded-lg shadow-md text-center">
//       <h2 className="text-xl font-semibold mb-2">Gps spoofing</h2>
//       <p className="text-sm text-gray-700">released soon...</p>
//     </div>
//   );
// }
