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

/* ---------------- SCHEMA ---------------- */

const DetectSybilAttackInputSchema = z.object({
  x: z.number(),
  y: z.number(),
  speed: z.number(),
  acceleration: z.number(),
});

type DetectSybilAttackInput = z.infer<typeof DetectSybilAttackInputSchema>;

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

      if (isMalicious) {
        setMaliciousCount((prev) => prev + 1);
      }

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

      if (isMalicious) {
        setMaliciousCount((prev) => prev + 1);
      }
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
          <CardContent className="flex flex-col items-center justify-center min-h-[630px] space-y-4">
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
                {/* 👇 malicious count display */}
                <p className="text-lg font-semibold text-destructive">
                  Total Malicious Detected: {maliciousCount}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Submit data to get prediction</p>
            )}
          </CardContent>
        </Card>
        <SensorSpoofingCard />
      </div>
    </div>
  );
}