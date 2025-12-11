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
import { getGpsSpoofingPrediction } from '@/app/actions';
import {
  DetectGpsSpoofingInputSchema,
  type DetectGpsSpoofingInput,
  type DetectGpsSpoofingOutput,
} from '@/ai/schemas/detect-gps-spoofing-schemas';

const sampleData = {
  a: { signal_strength_anomaly: -15.2, time_discrepancy_ns: 4800, position_jump_m: 150.7 },
  b: { signal_strength_anomaly: -2.1, time_discrepancy_ns: 50, position_jump_m: 2.5 },
  c: { signal_strength_anomaly: 0.5, time_discrepancy_ns: 120, position_jump_m: 8.1 },
};

export default function GpsSpoofingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<DetectGpsSpoofingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<DetectGpsSpoofingInput | null>(null);

  const { control, handleSubmit, reset } = useForm<DetectGpsSpoofingInput>({
    resolver: zodResolver(DetectGpsSpoofingInputSchema),
    defaultValues: sampleData.a,
  });

  const handleRunDetection = async (data: DetectGpsSpoofingInput) => {
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    const predictionResult = await getGpsSpoofingPrediction(data);

    if (predictionResult.error || !predictionResult.result) {
      setError(predictionResult.error || 'An unknown error occurred.');
    } else {
      setPrediction(predictionResult.result);
    }
    setIsLoading(false);
  };
  
  const loadSample = (sample: 'a' | 'b' | 'c') => {
    reset(sampleData[sample]);
    setPrediction(null);
    setError(null);
    setCsvData(null);
    setFileName(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setFileName(file.name);
    setCsvData(null);
    setPrediction(null);
    setError(null);


    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines[1].split(',').map(d => parseFloat(d.trim()));

        const dataObject: { [key: string]: number } = {};
        headers.forEach((header, index) => {
          if (Object.keys(sampleData.a).includes(header)) {
            dataObject[header] = data[index];
          }
        });
        
        const parsedData = DetectGpsSpoofingInputSchema.safeParse(dataObject);
        if (parsedData.success) {
          reset(parsedData.data);
          setCsvData(parsedData.data);
        } else {
          throw new Error("CSV file format is incorrect or doesn't contain required columns.");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse CSV file.");
        console.error(e);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
       <div className="flex flex-col gap-6">
         <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Upload GPS Data CSV</CardTitle>
            <CardDescription>
              Submit a CSV with GPS signal data. The first data row will be used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
              <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                Choose a file
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">{fileName || 'or drag and drop'}</p>
              <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => csvData && handleRunDetection(csvData)}
              disabled={!csvData || isLoading}
              className="w-full"
            >
              {isLoading && csvData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run CSV Analysis
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Run GPS Spoofing Detection</CardTitle>
            <CardDescription>
              Enter GPS data manually to analyze for spoofing patterns or load a sample.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadSample('a')}>Sample A (Spoofed)</Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('b')}>Sample B (Benign)</Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('c')}>Sample C (Benign)</Button>
            </div>
            <form onSubmit={handleSubmit(handleRunDetection)} className="grid grid-cols-1 gap-4">
              {(Object.keys(sampleData.a) as Array<keyof DetectGpsSpoofingInput>).map((key) => (
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
              <div className="col-span-1">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && !csvData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Run Manual Detection
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">AI Detection Results</CardTitle>
          <CardDescription>Real-time analysis from the AI model.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
        {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        ) : error ? (
            <div className="text-center text-destructive flex flex-col items-center gap-2">
                <AlertCircle className="h-10 w-10" />
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
            </div>
        ) : prediction ? (
          <div className="w-full space-y-6">
            <div className="flex flex-col items-center justify-around gap-6 sm:flex-row">
                 <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Result</p>
                    {prediction.isSpoofing ? (
                        <div className="flex items-center gap-2 text-2xl font-bold text-destructive">
                            <AlertCircle />
                            <span>Spoofing Detected</span>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-2xl font-bold text-success">
                            <CheckCircle />
                            <span>Nominal</span>
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
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{prediction.reasoning}</p>
            </div>
          </div>
        ) : (
           <div className="text-center text-muted-foreground flex flex-col items-center gap-2">
                <ShieldQuestion className="h-10 w-10" />
                <p>Submit GPS data to see the AI prediction.</p>
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
