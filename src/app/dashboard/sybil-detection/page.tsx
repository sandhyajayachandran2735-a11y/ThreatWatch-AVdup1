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
import { useFirestore } from '@/firebase';
import { addSybilAttackLog } from '@/firebase/firestore/sybil-attacks';
import { useToast } from '@/hooks/use-toast';
import { getSybilAttackPrediction } from '@/app/actions';
import {
  DetectSybilAttackInputSchema,
  type DetectSybilAttackInput,
  type DetectSybilAttackOutput,
} from '@/ai/schemas/detect-sybil-attack-schemas';

// Sample data for easy testing
const sampleData = {
  a: { position_x: 156.0186, position_y: 869.6497, speed: 14.29872, direction: 66.80889, acceleration: -0.10746, signal_strength: -92.9876, trust_score: 0.282821, sybil_attack_attempts: 2},
  b: { position_x: 181.825, position_y: 211.7459, speed: 15.09628, direction: 312.24444, acceleration: -0.94809, signal_strength: -53.4068, trust_score: 0.95, sybil_attack_attempts: 0},
  c: { position_x: 374.5401, position_y: 393.6355, speed: 11.20922, direction: 179.8813, acceleration: 1.37999, signal_strength: -74.8686, trust_score: 0.733277, sybil_attack_attempts: 1},
};


export default function SybilDetectionPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<DetectSybilAttackOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<DetectSybilAttackInput | null>(null);


  const { control, handleSubmit, reset, setValue } = useForm<DetectSybilAttackInput>({
    resolver: zodResolver(DetectSybilAttackInputSchema),
    defaultValues: sampleData.a,
  });

  const handleRunDetection = async (data: DetectSybilAttackInput) => {
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    const predictionResult = await getSybilAttackPrediction(data);

    if (predictionResult.error || !predictionResult.result) {
      setError(predictionResult.error || 'An unknown error occurred.');
    } else {
      setPrediction(predictionResult.result);
       if (firestore) {
         addSybilAttackLog(firestore, {
           sybilNodeCount: predictionResult.result.isMalicious ? 1 : 0,
           riskScore: predictionResult.result.confidence * 100,
           nodes: [
            { vehicleId: 'V-SIMULATED', confidence: `${Math.round(predictionResult.result.confidence * 100)}%` },
           ]
         });
         toast({
           title: 'Detection Logged',
           description: 'The Sybil attack analysis has been saved.',
         });
       }
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
      
        const parsedData = DetectSybilAttackInputSchema.safeParse(dataObject);
        if (parsedData.success) {
          reset(parsedData.data);
          setCsvData(parsedData.data);
        } else {
            setError("CSV file format is incorrect or doesn't contain required columns.");
            console.error(parsedData.error);
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
            <CardTitle className="text-xl font-semibold">Upload Vehicle Data CSV</CardTitle>
            <CardDescription>
              Submit a CSV file for Sybil attack analysis. The first data row will be used.
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
            <CardTitle className="text-xl font-semibold">Run Sybil Attack Detection Manually</CardTitle>
            <CardDescription>
              Enter vehicle data to analyze for Sybil attack patterns or load a sample.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadSample('a')}>Sample A (Malicious)</Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('b')}>Sample B (Benign)</Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('c')}>Sample C (Benign)</Button>
            </div>
            <form onSubmit={handleSubmit(handleRunDetection)} className="grid grid-cols-2 gap-4">
              {(Object.keys(sampleData.a) as Array<keyof DetectSybilAttackInput>).map((key) => (
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
                    {prediction.isMalicious ? (
                        <div className="flex items-center gap-2 text-2xl font-bold text-destructive">
                            <AlertCircle />
                            <span>Malicious</span>
                        </div>
                    ) : (
                         <div className="flex items-center gap-2 text-2xl font-bold text-success">
                            <CheckCircle />
                            <span>Benign</span>
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
                <p>Submit vehicle data to see the AI prediction.</p>
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
