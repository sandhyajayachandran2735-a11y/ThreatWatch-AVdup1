'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  DialogFooter,
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
import { PlusCircle, Trash2, MapPin, Radar, FileText, Upload, FileCode, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Mission {
  id: number;
  title: string;
  files: string[];
}

const initialSybilMissions: Mission[] = [
  { id: 1, title: 'Los Angeles', files: ['comm_log_la_01.csv'] },
  { id: 2, title: 'San Francisco', files: ['sf_traffic_data.json'] },
];

const initialSensorMissions: Mission[] = [
  { id: 101, title: 'New York Central', files: ['sensor_ny_stream.log'] },
];

export default function MissionsPage() {
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
      files: [...viewingMission.files, file.name],
    };

    if (targetType === 'sybil') {
      setSybilMissions(sybilMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    } else {
      setSensorMissions(sensorMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    }

    setViewingMission(updatedMission);
    e.target.value = ''; // Reset input
  };

  const handleDeleteFile = (fileName: string) => {
    if (!viewingMission) return;
    
    const updatedMission = {
      ...viewingMission,
      files: viewingMission.files.filter(f => f !== fileName),
    };

    if (targetType === 'sybil') {
      setSybilMissions(sybilMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    } else {
      setSensorMissions(sensorMissions.map(m => m.id === viewingMission.id ? updatedMission : m));
    }

    setViewingMission(updatedMission);
  };

  const MissionList = ({ missions, type }: { missions: Mission[]; type: 'sybil' | 'sensor' }) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {missions.map((mission) => (
        <Card 
          key={mission.id} 
          className="group relative overflow-hidden transition-all hover:shadow-lg border-2"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-bold text-foreground/90">{mission.title}</CardTitle>
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
                    This will permanently delete <span className="font-semibold">{mission.title}</span> and all {mission.files.length} associated files.
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11" 
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

      {/* Dialog for Adding Missions */}
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
          <DialogFooter>
            <Button onClick={handleAddMission} className="w-full h-11">Create Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Mission Data Storage */}
      <Dialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileCode className="h-6 w-6 text-primary" />
              {viewingMission?.title}
            </DialogTitle>
            <DialogDescription className="text-base">
              Manage data files and communication logs for this mission location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 bg-muted/10 transition-colors hover:bg-muted/20">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-base font-medium text-center mb-6 text-muted-foreground">
                Drag and drop CSV logs or click to upload
              </p>
              <Label 
                htmlFor="mission-file-upload" 
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
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
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Stored Logs
                </h3>
                <span className="text-sm text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">
                  {viewingMission?.files.length || 0} Total
                </span>
              </div>
              <Separator />
              
              <ScrollArea className="h-[250px] pr-4">
                <div className="space-y-3">
                  {viewingMission?.files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm italic">No data logs stored for this sector.</p>
                    </div>
                  ) : (
                    viewingMission?.files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border-2 group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-background rounded-lg border shadow-sm">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold truncate max-w-[200px]">{file}</span>
                            <span className="text-xs text-muted-foreground">Communication Log</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteFile(file)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="w-full h-11" onClick={() => setStorageDialogOpen(false)}>Close Storage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
