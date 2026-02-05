'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
import { AlertCircle, Loader2, UploadCloud, ShieldCheck, ShieldAlert, ListChecks } from 'lucide-react';
import { Gauge } from '@/components/gauge';
import { useToast } from '@/hooks/use-toast';
import SpoofingCard from "../sybil-detection/spoofing";
import { useMaliciousCount } from '../context/malicious-count-context';
import { useAnalysis } from '../context/analysis-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSybilAttackPrediction } from '@/app/actions';

const DetectSybilAttackInputSchema = z.object({
  x: z.number(),
  y: z.number(),
  speed: z.number(),
  acceleration: z.number(),
});

type DetectSybilAttackInput = z.infer<typeof DetectSybilAttackInputSchema>;

type SybilPredictionResult = {
  prediction: 0 | 1;
  confidence: number;
  used_features?: string[];
  reasoning?: string;
  mitigationSteps?: string[];
};

const sampleData = {
  a: {
    x: 156.0186,
    y: 869.6497,
    speed: 14.29872,
    acceleration: -0.10746
  },
};

export default function SybilDetectionPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const { setMaliciousCount } = useMaliciousCount();
  const { activeFile, activeType, clearAnalysis } = useAnalysis();

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<{
    isMalicious: boolean;
    confidence: number;
    reasoning: string;
    mitigationSteps: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const { control, handleSubmit } = useForm<DetectSybilAttackInput>({
    resolver: zodResolver(DetectSybilAttackInputSchema),
  });

  const saveToHistory = (isMalicious: boolean, confidence: number, reasoning: string, mitigationSteps: string[], source: 'Manual' | 'CSV', inputs: any) => {
    if (!db) return;
    
    const logData = {
      detectedAt: serverTimestamp(),
      threatType: 'Sybil',
      riskScore: isMalicious ? confidence * 100 : 0,
      source,
      detectedEntities: isMalicious ? 'Potential Sybil Node' : 'Benign Node',
      details: {
        isMalicious,
        confidence,
        reasoning,
        mitigationSteps,
        inputs
      }
    };

    addDoc(collection(db, 'threat_events'), logData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'threat_events',
          operation: 'create',
          requestResourceData: logData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handlePredictionResult = async (result: SybilPredictionResult, source: 'Manual' | 'CSV', inputs: any) => {
    const isMalicious = result.prediction === 1;
    const confidence = result.confidence ?? 0.5;
    
    // Call AI Advisor for dynamic reasoning and mitigation
    try {
      const aiResponse = await getSybilAttackPrediction({
        position_x: inputs.x || 0,
        position_y: inputs.y || 0,
        speed: inputs.speed || 0,
        direction: 0,
        acceleration: inputs.acceleration || 0,
        signal_strength: 0,
        trust_score: isMalicious ? 0.1 : 0.9,
        sybil_attack_attempts: isMalicious ? 5 : 0,
      });

      const reasoning = aiResponse.result?.reasoning || (isMalicious
        ? `Potential Sybil Attack Detected: This vehicle is broadcasting data patterns characteristic of identity spoofing. Our AI identifies that this node may be creating phantom personas to disrupt navigation protocols.`
        : `Safe Operation Confirmed: The vehicle's communication profile is consistent with legitimate physical movement and standard network behavior.`);

      const mitigationSteps = aiResponse.result?.mitigationSteps || (isMalicious 
        ? ["Isolate the detected vehicle ID from the network", "Initiate identity re-verification for all nodes in the sector", "Update local VANET trust certificates"]
        : ["Perform routine communication integrity check", "Log benign activity for behavior baseline", "Ensure firmware is updated to the latest security patch"]);

      setPrediction({
        isMalicious,
        confidence: confidence,
        reasoning,
        mitigationSteps,
      });

      if (isMalicious) {
        setMaliciousCount(prevCount => prevCount + 1);
      }

      saveToHistory(isMalicious, confidence, reasoning, mitigationSteps, source, inputs);

      toast({
        title: 'Analysis complete',
        description: isMalicious ? 'Malicious activity detected!' : 'Behavior appears benign.',
        variant: isMalicious ? 'destructive' : 'default',
      });
    } catch (e) {
      console.error("AI Advisor failed", e);
       setPrediction({
        isMalicious,
        confidence: confidence,
        reasoning: "Analysis report failed to generate. Please check network logs manually.",
        mitigationSteps: isMalicious ? ["Flag for immediate review", "Isolate node"] : ["Monitor node activity"],
      });
    }
  };

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
      await handlePredictionResult(result, 'Manual', data);

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

  const runCsvPrediction = async (fileToUse: File) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUse);

      const response = await fetch('https://sybil-backend.onrender.com/predict-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result: SybilPredictionResult = await response.json();
      await handlePredictionResult(result, 'CSV', { filename: fileToUse.name });
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

  const handleCsvUpload = async () => {
    if (!file) return;
    runCsvPrediction(file);
  };

  useEffect(() => {
    if (activeFile && activeType === 'sybil') {
      runCsvPrediction(activeFile);
      clearAnalysis();
    }
  }, [activeFile, activeType, clearAnalysis]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
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
                  {isLoading && !file ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Run Manual Prediction
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <SpoofingCard />
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prediction Result</CardTitle>
             <CardDescription>AI-Powered Threat Advisor Analysis.</CardDescription>
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
              <div className="flex flex-col items-center text-center space-y-6 w-full">
                <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Analysis Complete</p>
                </div>
                {prediction.isMalicious ? (
                  <div className="text-destructive text-2xl flex items-center justify-center gap-2 font-bold">
                    <ShieldAlert className="h-7 w-7" /> Malicious Node
                  </div>
                ) : (
                  <div className="text-success text-2xl flex items-center justify-center gap-2 font-bold">
                    <ShieldCheck className="h-7 w-7" /> Benign Node
                  </div>
                )}
                
                <div className="flex justify-center w-full">
                  <Gauge value={Math.round(prediction.confidence * 100)} label="Confidence" />
                </div>
                
                <Tabs defaultValue="reasoning" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="reasoning">Detailed Reasoning</TabsTrigger>
                    <TabsTrigger value="mitigation">Mitigation Steps</TabsTrigger>
                  </TabsList>
                  <TabsContent value="reasoning" className="text-left mt-4">
                    <p className="text-sm text-muted-foreground bg-muted p-4 rounded-md leading-relaxed">
                        {prediction.reasoning}
                    </p>
                  </TabsContent>
                  <TabsContent value="mitigation" className="text-left mt-4">
                    <div className="bg-muted p-4 rounded-md space-y-3 border-l-4 border-primary">
                        <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <ListChecks className="h-4 w-4" />
                            Recommended Actions
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                            {prediction.mitigationSteps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center gap-3 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 opacity-20" />
                <p>Submit data to get an AI-powered prediction and advisor report.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
