'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Trash2, ShieldAlert, Radar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const initialSybilMissions = [
  { id: 1, title: 'Bangalore', status: 'In Progress', statusVariant: 'default' },
  { id: 2, title: 'Chennai', status: 'Planned', statusVariant: 'outline' },
  { id: 3, title: 'Mumbai', status: 'Planned', statusVariant: 'outline' },
];

const initialSensorMissions = [
  { id: 101, title: 'Delhi Route Alpha', status: 'Completed', statusVariant: 'secondary' },
];

const statusOptions = {
  'In Progress': 'default',
  'Completed': 'secondary',
  'Alert': 'destructive',
  'Planned': 'outline',
};

type MissionStatus = keyof typeof statusOptions;

interface Mission {
  id: number;
  title: string;
  status: string;
  statusVariant: string;
}

export default function MissionsPage() {
  const mapThumbnail = PlaceHolderImages.find((p) => p.id === 'mission-map-thumbnail');
  
  const [sybilMissions, setSybilMissions] = useState<Mission[]>(initialSybilMissions);
  const [sensorMissions, setSensorMissions] = useState<Mission[]>(initialSensorMissions);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetType, setTargetType] = useState<'sybil' | 'sensor'>('sybil');
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionStatus, setNewMissionStatus] = useState<MissionStatus>('Planned');

  const openAddDialog = (type: 'sybil' | 'sensor') => {
    setTargetType(type);
    setDialogOpen(true);
  };

  const handleAddMission = () => {
    if (!newMissionTitle) return;

    const allMissions = [...sybilMissions, ...sensorMissions];
    const newId = allMissions.length > 0 ? Math.max(...allMissions.map((m) => m.id)) + 1 : 1;

    const newMission: Mission = {
      id: newId,
      title: newMissionTitle,
      status: newMissionStatus,
      statusVariant: statusOptions[newMissionStatus],
    };

    if (targetType === 'sybil') {
      setSybilMissions([...sybilMissions, newMission]);
    } else {
      setSensorMissions([...sensorMissions, newMission]);
    }

    setNewMissionTitle('');
    setNewMissionStatus('Planned');
    setDialogOpen(false);
  };

  const handleDeleteMission = (missionId: number, type: 'sybil' | 'sensor') => {
    if (type === 'sybil') {
      setSybilMissions(sybilMissions.filter((m) => m.id !== missionId));
    } else {
      setSensorMissions(sensorMissions.filter((m) => m.id !== missionId));
    }
  };

  const MissionList = ({ missions, type }: { missions: Mission[]; type: 'sybil' | 'sensor' }) => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {missions.map((mission) => (
        <Card key={mission.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <CardTitle className="text-lg font-semibold">{mission.title}</CardTitle>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the mission
                    <span className="font-semibold"> {mission.title}</span>.
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
          <CardContent>
            {mapThumbnail && (
              <div className="aspect-video overflow-hidden rounded-md">
                <Image
                  src={`${mapThumbnail.imageUrl}?seed=${mission.id}`}
                  alt="Map thumbnail"
                  width={400}
                  height={200}
                  className="h-full w-full object-cover"
                  data-ai-hint={mapThumbnail.imageHint}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Badge variant={mission.statusVariant as any}>{mission.status}</Badge>
          </CardFooter>
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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold font-headline">Missions & Storage</h1>
        <p className="text-muted-foreground">
          Manage location-based data and analysis logs for threat detection.
        </p>
      </div>

      {/* Sybil Attack Section */}
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

      {/* Sensor Spoofing Section */}
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

      {/* Shared Dialog for Adding Missions */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                onValueChange={(value: MissionStatus) => setNewMissionStatus(value)}
                defaultValue={newMissionStatus}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusOptions).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddMission}>Create Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
