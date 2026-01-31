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
import { PlusCircle, Trash2, ShieldAlert, Radar, FileText, Upload, FileCode } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Mission {
  id: number;
  title: string;
  files: string[];
}

const initialSybilMissions: Mission[] = [
  { id: 1, title: 'Bangalore', files: ['comm_log_001.csv', 'node_analysis_v1.pdf'] },
  { id: 2, title: 'Chennai', files: ['चेन्नई_traffic_data.json'] },
  { id: 3, title: 'Mumbai', files: [] },
];

const initialSensorMissions: Mission[] = [
  { id: 101, title: 'Delhi Route Alpha', files: ['sensor_stream_dump.log'] },
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
          className="cursor-pointer transition-shadow hover:shadow-md group relative overflow-hidden"
          onClick={() => openStorage(mission, type)}
        >
          <CardHeader className="flex flex-row items-start justify-between">
            <CardTitle className="text-lg font-semibold">{mission.title}</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the mission
                    <span className="font-semibold"> {mission.title}</span> and all its stored files.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteMission(mission.id, type)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {mapThumbnail && (
              <div className="aspect-video overflow-hidden rounded-md">
                <Image
                  src={`${mapThumbnail.imageUrl}?seed=${mission.id}`}
                  alt="Map thumbnail"
                  width={400}
                  height={200}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  data-ai-hint={mapThumbnail.imageHint}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>{mission.files.length} files stored</span>
              </div>
              <Button variant="outline" size="sm" className="h-8">View Storage</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {missions.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
          No missions found in this category.
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-semibold font-headline">Missions & Storage</h1>
        <p className="text-muted-foreground">
          Manage location-based data and analysis logs for threat detection. Use "View Storage" to manage files for each mission.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-primary h-6 w-6" />
            <h2 className="text-2xl font-semibold">Sybil Attack File Storage</h2>
          </div>
          <Button onClick={() => openAddDialog('sybil')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Sybil Mission
          </Button>
        </div>
        <Separator />
        <MissionList missions={sybilMissions} type="sybil" />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="text-accent h-6 w-6" />
            <h2 className="text-2xl font-semibold">Sensor Spoofing File Storage</h2>
          </div>
          <Button variant="secondary" onClick={() => openAddDialog('sensor')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Sensor Mission
          </Button>
        </div>
        <Separator />
        <MissionList missions={sensorMissions} type="sensor" />
      </section>

      {/* Dialog for Adding Missions */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New {targetType === 'sybil' ? 'Sybil' : 'Sensor'} Mission</DialogTitle>
            <DialogDescription>
              Enter the details for the new location or storage entry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newMissionTitle}
                onChange={(e) => setNewMissionTitle(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Downtown Sector A"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddMission}>Create Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Mission File Storage (View Mission Details) */}
      <Dialog open={storageDialogOpen} onOpenChange={setStorageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              {viewingMission?.title} - Mission Data Storage
            </DialogTitle>
            <DialogDescription>
              Upload and manage CSV logs or other data files for this specific location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-muted/30">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-center mb-4 text-muted-foreground">
                Upload CSV or communication log files
              </p>
              <Label 
                htmlFor="mission-file-upload" 
                className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
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
            
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Stored Files ({viewingMission?.files.length || 0})
              </h3>
              <Separator />
              
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {viewingMission?.files.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No files stored for this mission yet.
                    </p>
                  ) : (
                    viewingMission?.files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-md bg-muted/50 border group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-md border">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{file}</span>
                            <span className="text-xs text-muted-foreground">Stored Log</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteFile(file)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setStorageDialogOpen(false)}>Close Storage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
