
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
import SpoofingCard from "../sybil-detection/spoofing";
import SensorSpoofingCard from "../sybil-detection/sensor_spoofing";
import { useMaliciousCount } from '../context/malicious-count-context';
import { useFirestore } from '@/firebase';
import { addDetectionLog } from '@/firebase/firestore/detection-logs';


/* ---------------- SCHEMA ---------------- */

const DetectSybilAttackInputSchema = z.object({
  x: z.number(),
  y: z.number(),
  speed: z.number(),
  acceleration: z.number(),
});

type DetectSybilAttackInput = z.infer<typeof DetectSybilAttackInputSchema>;

// Define the type for the backend response
type SybilPredictionResult = {
  prediction: 0 | 1;
  confidence: number;
  used_features?: string[];
};

/* ---------------- SAMPLE DATA ---------------- */

const sampleData = {
  a: {
    x: 156.0186,
    y: 869.6497,
    speed: 14.29872,
    acceleration: -0.10746
  },
};

/* ---------------- COMPONENT ---------------- */

export default function SybilDetectionPage() {
  const { toast } = useToast();
  const { maliciousCount, setMaliciousCount } = useMaliciousCount();
  const firestore = useFirestore();


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

  /* ---------------- COMMON PREDICTION HANDLER ---------------- */
  const handlePredictionResult = (result: SybilPredictionResult) => {
    const isMalicious = result.prediction === 1;
    const confidence = result.confidence ?? 0.5;

    setPrediction({
      isMalicious,
      confidence: confidence,
      reasoning: isMalicious
        ? `Random Forest detected Sybil behavior with ${Math.round(confidence * 100)}% confidence.`
        : `Random Forest detected benign behavior with ${Math.round(confidence * 100)}% confidence.`,
    });

    if (isMalicious) {
      setMaliciousCount(prevCount => prevCount + 1);
    }

    addDetectionLog(firestore, {
      type: 'Sybil',
      result: isMalicious ? 'Malicious' : 'Benign',
      confidence: confidence * 100,
      details: `Nodes: CSV/Manual, Confidence: ${(confidence * 100).toFixed(0)}%`,
    });

    toast({
      title: 'Prediction successful',
      description: isMalicious ? 'Malicious activity detected!' : 'Behavior appears benign.',
      variant: isMalicious ? 'destructive' : 'default',
    });
  };

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
      
      const result: SybilPredictionResult = await response.json();
      handlePredictionResult(result);

    } catch (e: any) {
      setError(e.message);
      toast({
          title: 'Prediction Failed',
          description: e.message,
          variant: 'destructive'
      })
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

      const result: SybilPredictionResult = await response.json();
      handlePredictionResult(result);
    } catch (e: any) {
      setError(e.message);
      toast({
          title: 'CSV Prediction Failed',
          description: e.message,
          variant: 'destructive'
      })
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
            <CardDescription>Upload vehicle data CSV for batch prediction.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 flex-col items-center justify-center border-2 border-dashed rounded-lg">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
               <Label htmlFor="csv-upload" className="cursor-pointer text-primary hover:underline">
                Choose a file
              </Label>
               <p className="mt-1 text-sm text-muted-foreground">{file?.name || 'or drag and drop'}</p>
              <Input
                id="csv-upload"
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCsvUpload} disabled={!file || isLoading} className="w-full">
              {isLoading && file && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Predict from CSV
            </Button>
          </CardFooter>
        </Card>

        {/* MANUAL CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Input</CardTitle>
            <CardDescription>Enter feature values for a single prediction.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRunDetection)} className="grid grid-cols-2 gap-4">
              {Object.keys(sampleData.a).map((key) => (
                <div key={key}>
                  <Label htmlFor={key}>{key.replace(/_/g, ' ')}</Label>
                  <Controller
                    name={key as keyof DetectSybilAttackInput}
                    control={control}
                    render={({ field }) => (
                      <Input
                        id={key}
                        type="number"
                        step="any"
                        placeholder={`e.g. ${sampleData.a[key as keyof typeof sampleData.a]}`}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    )}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && !file && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Run Manual Prediction
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
             <CardDescription>Real-time analysis from the backend model.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[630px] space-y-4">
            {isLoading ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : error ? (
              <div className="text-destructive text-center flex flex-col items-center gap-2">
                <AlertCircle className="h-10 w-10" />
                <p className="font-semibold">Error</p>
                <p className="text-sm max-w-sm">{error}</p>
              </div>
            ) : prediction ? (
              <div className="text-center space-y-4 w-full">
                <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Total Malicious Alerts Today</p>
                    <p className="text-2xl font-bold">{maliciousCount}</p>
                </div>
                {prediction.isMalicious ? (
                  <div className="text-destructive text-2xl flex items-center justify-center gap-2 font-bold">
                    <AlertCircle /> Malicious
                  </div>
                ) : (
                  <div className="text-success text-2xl flex items-center justify-center gap-2 font-bold">
                    <CheckCircle /> Benign
                  </div>
                )}
                <Gauge value={Math.round(prediction.confidence * 100)} label="Confidence" />
                <Separator />
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{prediction.reasoning}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center">Submit data to get a prediction.</p>
            )}
          </CardContent>
        </Card>
        {/* <SensorSpoofingCard /> */}
      </div>
    </div>
  );
}
