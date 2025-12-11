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
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Loader2, ShieldQuestion, UploadCloud } from 'lucide-react';
import { Gauge } from '@/components/gauge';
import { getSensorAnomalyPrediction } from '@/app/actions';
import {
  DetectSensorAnomalyInputSchema,
  type DetectSensorAnomalyInput,
  type DetectSensorAnomalyOutput,
} from '@/ai/schemas/detect-sensor-anomaly-schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sampleData = {
  a: { sensor_type: 'LIDAR', reading: 150.5, redundancy_check_ok: 0, time_since_last_reading_ms: 5, expected_range_min: 20, expected_range_max: 100 },
  b: { sensor_type: 'CAMERA', reading: 1, redundancy_check_ok: 1, time_since_last_reading_ms: 33, expected_range_min: 0, expected_range_max: 1 },
  c: { sensor_type: 'RADAR', reading: 45.2, redundancy_check_ok: 1, time_since_last_reading_ms: 40, expected_range_min: 1, expected_range_max: 200 },
};

const sensorTypes = ["LIDAR", "RADAR", "CAMERA", "IMU", "GPS"];


export default function SensorSpoofingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<DetectSensorAnomalyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<DetectSensorAnomalyInput>({
    resolver: zodResolver(DetectSensorAnomalyInputSchema),
    defaultValues: sampleData.a,
  });

  const handleRunDetection = async (data: DetectSensorAnomalyInput) => {
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    const predictionResult = await getSensorAnomalyPrediction(data);

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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const dataRow = lines[1].split(',');

        const dataObject: { [key: string]: any } = {};
        headers.forEach((header, index) => {
          if (Object.keys(sampleData.a).includes(header)) {
             const value = dataRow[index].trim();
             if (header === 'sensor_type') {
                dataObject[header] = value;
             } else {
                dataObject[header] = parseFloat(value);
             }
          }
        });
        
        const parsedData = DetectSensorAnomalyInputSchema.safeParse(dataObject);
        if (parsedData.success) {
          reset(parsedData.data);
          handleRunDetection(parsedData.data);
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
            <CardTitle className="text-xl font-semibold">Upload Sensor Data CSV</CardTitle>
            <CardDescription>
              Submit a CSV with sensor data. The first data row will be used for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <UploadCloud className="mb-4 h-10 w-10 text-muted-foreground" />
              <Label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
                Choose a file
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">{fileName || 'or drag and drop'}</p>
              <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Run Sensor Anomaly Detection</CardTitle>
            <CardDescription>
              Enter sensor data manually to analyze for anomalies or load a sample.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadSample('a')}>Sample A (Anomaly)</Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('b')}>Sample B (Anomaly)</Button>
              <Button variant="outline" size="sm" onClick={() => loadSample('c')}>Sample C (Benign)</Button>
            </div>
            <form onSubmit={handleSubmit(handleRunDetection)} className="grid grid-cols-2 gap-4">
               
                <div className="space-y-2 col-span-2">
                    <Label>Sensor Type</Label>
                    <Controller
                        name="sensor_type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sensor type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sensorTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

              {(Object.keys(sampleData.a) as Array<keyof DetectSensorAnomalyInput>).map((key) => {
                  if (key === 'sensor_type') return null;
                  return (
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
                  )
              })}
              <div className="col-span-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
                    {prediction.isAnomaly ? (
                        <div className="flex items-center gap-2 text-2xl font-bold text-destructive">
                            <AlertCircle />
                            <span>Anomaly Detected</span>
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
                <p>Submit sensor data to see the AI prediction.</p>
            </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
