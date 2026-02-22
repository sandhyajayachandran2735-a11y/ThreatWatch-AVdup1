'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, MapPin, Radar, FileText, Upload, PlayCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAnalysis } from '../context/analysis-context';

interface MissionFile {
  name: string;
  data: File | null;
}

interface Mission {
  id: number;
  title: string;
  files: MissionFile[];
}

const initialSybilMissions: Mission[] = [
  { id: 1, title: 'Bangalore', files: [{ name: 'comm_log_la_01.csv', data: null }] },
  { id: 2, title: 'Pune', files: [{ name: 'sf_traffic_data.csv', data: null }] },
];

const initialSensorMissions: Mission[] = [
  { id: 101, title: 'Mumbai', files: [{ name: 'sensor_ny_stream.csv', data: null }] },
  // {
  //   id: 102,title: 'Urban Canyon Test',files: [{ name: 'sensor1_ny_stream.csv', data: null }]
  // },
];

export default function MissionsPage() {
  const router = useRouter();
  const { setAnalysis } = useAnalysis();
  const mapThumbnail = PlaceHolderImages.find((p) => p.id === 'mission-map-thumbnail');
  
  const [sybilMissions, setSybilMissions] = useState<Mission[]>(initialSybilMissions);
  const [sensorMissions, setSensorMissions] = useState<Mission[]>(initialSensorMissions);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [targetType, setTargetType] = useState<'sybil' | 'sensor'>('sybil');
  const [newMissionTitle, setNewMissionTitle] = useState('');
  
  const [viewingMission, setViewingMission] = useState<Mission | null>(null);

  const openAddDialog = (type: 'sybil' | 'sensor') => {
    setTargetType(type);
    setAddDialogOpen(true);
  };

  const handleAddMission = () => {
    if (!newMissionTitle) return;

    const allMissions = [...sybilMissions, ...sensorMissions];
    const newId = allMissions.length > 0 ? Math.max(...allMissions.map((m) => m.id)) + 1 : 1;

    const newMission: Mission = {
      id: newId,
      title: newMissionTitle,
      files: [],
    };

    if (targetType === 'sybil') {
      setSybilMissions([...sybilMissions, newMission]);
    } else {
      setSensorMissions([...sensorMissions, newMission]);
    }

    setNewMissionTitle('');
    setAddDialogOpen(false);
  };

  const handleDeleteMission = (missionId: number, type: 'sybil' | 'sensor') => {
    if (type === 'sybil') {
      setSybilMissions(sybilMissions.filter((m) => m.id !== missionId));
    } else {
      setSensorMissions(sensorMissions.filter((m) => m.id !== missionId));
    }
    if (viewingMission?.id === missionId) setViewingMission(null);
  };

  const openStorage = (mission: Mission, type: 'sybil' | 'sensor') => {
    setViewingMission(mission);
    setTargetType(type);
    setStorageDialogOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !viewingMission) return;
    
    const updatedMission = {
      ...viewingMission,
      files: [...viewingMission.files, { name: file.name, data: file }],
    };

    if (targetType === 'sybil') {
      setSybilMissions(sybilMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    } else {
      setSensorMissions(sensorMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    }

    setViewingMission(updatedMission);
    e.target.value = ''; 
  };

  const handleDeleteFile = (fileName: string) => {
    if (!viewingMission) return;
    
    const updatedMission = {
      ...viewingMission,
      files: viewingMission.files.filter(f => f.name !== fileName),
    };

    if (targetType === 'sybil') {
      setSybilMissions(sybilMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    } else {
      setSensorMissions(sensorMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    }

    setViewingMission(updatedMission);
  };

  const handleAnalyze = (fileObj: MissionFile) => {
    let fileToAnalyze = fileObj.data;
    if (!fileToAnalyze) {
      // Create a dummy CSV for the initial files so prediction flow can be tested
      fileToAnalyze = new File(["x,y,speed,acceleration\n156.0,869.6,14.2,-0.1"], fileObj.name, { type: 'text/csv' });
    }
    setAnalysis(fileToAnalyze, targetType);
    router.push(`/dashboard/${targetType === 'sybil' ? 'sybil-detection' : 'sensor-spoofing'}`);
  };

  const MissionList = ({ missions, type }: { missions: Mission[]; type: 'sybil' | 'sensor' }) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {missions.map((mission) => (
        <Card 
          key={mission.id} 
          className="group relative overflow-hidden transition-all hover:shadow-lg border-2"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold text-[#1a2b4b]">{mission.title}</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Mission?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <span className="font-semibold">{mission.title}</span> and all associated files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteMission(mission.id, type)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {mapThumbnail && (
              <div className="aspect-[16/9] relative overflow-hidden rounded-md border">
                <Image
                  src={`${mapThumbnail.imageUrl}?seed=${mission.id}`}
                  alt="Map terrain"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={mapThumbnail.imageHint}
                />
              </div>
            )}
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11" 
              onClick={() => openStorage(mission, type)}
            >
              View Mission
            </Button>
          </CardContent>
        </Card>
      ))}
      {missions.length === 0 && (
        <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
          <p className="text-lg font-medium">No missions active in this sector.</p>
          <p className="text-sm">Click "Create Mission" to begin data tracking.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      <div className="space-y-1">
        <h1 className="text-4xl font-extrabold text-[#1a2b4b]">Missions & Data Management</h1>
        <p className="text-muted-foreground text-lg">
          Organize missions, manage data files, and trigger analysis.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <MapPin className="text-primary h-7 w-7" />
              <h2 className="text-2xl font-bold text-[#1a2b4b]">Sybil Missions</h2>
            </div>
            <p className="text-muted-foreground">Monitor and manage missions for Sybil threat analysis by location.</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 shadow-md"
            onClick={() => openAddDialog('sybil')}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Mission
          </Button>
        </div>
        <MissionList missions={sybilMissions} type="sybil" />
      </section>

      <section className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Radar className="text-accent h-7 w-7" />
              <h2 className="text-2xl font-bold text-[#1a2b4b]">Sensor Spoofing Missions</h2>
            </div>
            <p className="text-muted-foreground">Manage data storage and analysis logs for sensor anomaly detection.</p>
          </div>
          <Button 
            variant="secondary"
            className="bg-accent hover:bg-accent/90 text-white font-bold h-11 px-6 shadow-md"
            onClick={() => openAddDialog('sensor')}
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Mission
          </Button>
        </div>
        <MissionList missions={sensorMissions} type="sensor" />
      </section>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New {targetType === 'sybil' ? 'Sybil' : 'Sensor'} Mission</DialogTitle>
            <DialogDescription>
              Assign a location name for the new tracking mission.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Location Name</Label>
              <Input
                id="title"
                value={newMissionTitle}
                onChange={(e) => setNewMissionTitle(e.target.value)}
                placeholder="e.g., Downtown Sector A"
                className="h-11"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleAddMission} className="w-full h-11">Create Entry</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-[#1a2b4b] text-3xl font-bold">
                Mission Files: {viewingMission?.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-lg">
                Manage data files associated with this {targetType === 'sybil' ? 'Sybil' : 'Sensor'} detection mission.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all min-h-[300px]",
                viewingMission?.files.length === 0 ? "bg-muted/5 border-muted-foreground/20" : "bg-background border-muted"
              )}>
                {viewingMission?.files.length === 0 ? (
                  <div className="text-center space-y-2 p-10">
                    <p className="text-xl font-medium text-muted-foreground">No files uploaded.</p>
                    <p className="text-sm text-muted-foreground/80">Click below to add data files for this mission.</p>
                  </div>
                ) : (
                  <ScrollArea className="w-full max-h-[400px] px-6 py-4">
                    <div className="space-y-3">
                      {viewingMission?.files.map((fileObj, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-background rounded-lg border shadow-sm">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold truncate max-w-[180px]">{fileObj.name}</span>
                              <span className="text-xs text-muted-foreground">Communication Log</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="secondary"
                              size="sm"
                              className="bg-primary/10 text-primary hover:bg-primary/20 font-bold"
                              onClick={() => handleAnalyze(fileObj)}
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Analyze
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteFile(fileObj.name)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="pt-2">
                <Label 
                  htmlFor="mission-file-upload" 
                  className="cursor-pointer bg-muted/20 border-2 border-primary/20 hover:bg-muted/30 text-primary w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Upload className="h-5 w-5" />
                  Upload CSV File
                </Label>
                <Input 
                  id="mission-file-upload" 
                  type="file" 
                  className="sr-only" 
                  accept=".csv,.json,.log" 
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
