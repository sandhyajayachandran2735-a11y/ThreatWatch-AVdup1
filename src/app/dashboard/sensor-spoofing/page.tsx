'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { AlertCircle, CheckCircle, Loader2, ShieldQuestion, UploadCloud } from 'lucide-react';
import { Gauge } from '@/components/gauge';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
// import { useFirestore } from '@/firebase';
// import { addDetectionLog } from '@/firebase/firestore/detection-logs';

// Define the schema for the new input format
const SensorSpoofingInputSchema = z.object({
  speed_kmh: z.number(),
  acceleration_mps2: z.number(),
  lane_deviation: z.number(),
  obstacle_distance: z.number(),
  traffic_density: z.number(),
});

type SensorSpoofingInput = z.infer<typeof SensorSpoofingInputSchema>;

const defaultValues: SensorSpoofingInput = {
    speed_kmh: 44.94,
    acceleration_mps2: -0.75,
    lane_deviation: 0.96,
    obstacle_distance: 4.26,
    traffic_density: 41,
};


export default function SensorSpoofingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<{ action: string, confidence: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  // const firestore = useFirestore();

  const { control, handleSubmit, reset } = useForm<SensorSpoofingInput>({
    resolver: zodResolver(SensorSpoofingInputSchema),
    defaultValues: defaultValues,
  });

  const handlePredictionResult = (result: any) => {
    if (result.action) {
        const confidence = result.confidence ?? 0.5;
        setPrediction({
            action: result.action,
            confidence: confidence,
        });

        // addDetectionLog(firestore, {
        //     type: 'Sensor Spoofing',
        //     result: result.action,
        //     confidence: confidence * 100,
        //     details: `Used features: ${result.used_features?.join(', ') || 'N/A'}`
        // });

        toast({
            title: 'Analysis Complete',
            description: `Action: ${result.action}`,
            variant: result.prediction === 1 ? 'destructive' : 'default',
        });
    } else {
        throw new Error("Invalid response from backend.");
    }
  };

  const runPrediction = async (url: string, body: BodyInit) => {
    setIsLoading(true);
    setPrediction(null);
    setError(null);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: body,
          mode: 'cors',
        headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'An unknown error occurred.');
      }
      
      const result = await response.json();
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


  const handleRunDetection = async (data: SensorSpoofingInput) => {
    runPrediction('https://sybil-backend.onrender.com/predict-sensor-json', JSON.stringify({ features: Object.values(data) }));
  };

  const handleCsvUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    runPrediction('https://sybil-backend.onrender.com/predict-sensor-csv', formData);
  };


  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
         <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Upload Sensor Data CSV</CardTitle>
            <CardDescription>
              Submit a CSV with sensor data. The first data row will be used for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
              <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                Choose a file
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">{file?.name || 'or drag and drop'}</p>
              <Input id="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".csv" />
            </div>
          </CardContent>
           <CardFooter>
            <Button
              onClick={handleCsvUpload}
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading && file ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run CSV Analysis
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Run Sensor Spoofing Detection</CardTitle>
            <CardDescription>
              Enter sensor data manually to analyze for potential spoofing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleRunDetection)} className="grid grid-cols-2 gap-4">
              {(Object.keys(defaultValues) as Array<keyof SensorSpoofingInput>).map((key) => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                        <Controller
                            name={key}
                            control={control}
                            render={({ field }) => (
                                <Input {...field} id={key} type="number" step="any" onChange={e => field.onChange(e.target.valueAsNumber)} />
                            )}
                        />
                    </div>
              ))}
              <div className="col-span-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && !file ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Run Manual Detection
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Detection Results</CardTitle>
          <CardDescription>Real-time analysis from the sensor spoofing model.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
        {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        ) : error ? (
            <div className="text-center text-destructive flex flex-col items-center gap-2">
                <AlertCircle className="h-10 w-10" />
                <p className="font-semibold">Error</p>
                <p className="max-w-xs">{error}</p>
            </div>
        ) : prediction ? (
          <div className="w-full space-y-6">
            <div className="flex flex-col items-center justify-around gap-6 sm:flex-row">
                 <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Action Required</p>
                    {prediction.action === 'Normal Driving' ? (
                        <div className="flex items-center gap-2 text-2xl font-bold text-success">
                            <CheckCircle />
                            <span>{prediction.action}</span>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-2xl font-bold text-destructive">
                            <AlertCircle />
                            <span>{prediction.action}</span>
                        </div>
                    )}
                 </div>
                 <div className="flex flex-col items-center">
                   <Gauge value={Math.round(prediction.confidence * 100)} label="Confidence" />
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="font-medium mb-2">Reasoning</h3>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">The model determined the action '{prediction.action}' with {Math.round(prediction.confidence * 100)}% confidence based on the input sensor readings.</p>
            </div>
          </div>
        ) : (
           <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                <ShieldQuestion className="h-10 w-10" />
                <p>Submit sensor data to see the model's prediction.</p>
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
