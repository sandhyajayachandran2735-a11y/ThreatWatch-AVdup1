'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
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
import { PlusCircle, Trash2 } from 'lucide-react';

const initialMissions = [
  { id: 1, title: 'Alpha-7 Urban Route', status: 'In Progress', statusVariant: 'default' },
  { id: 2, title: 'Bravo-3 Highway Test', status: 'Completed', statusVariant: 'secondary' },
  { id: 3, title: 'Charlie-9 Night Run', status: 'Alert', statusVariant: 'destructive' },
  { id: 4, title: 'Delta-1 Logistics', status: 'Completed', statusVariant: 'secondary' },
  { id: 5, title: 'Echo-5 Suburban Path', status: 'Planned', statusVariant: 'outline' },
  { id: 6, title: 'Foxtrot-2 Rain Test', status: 'In Progress', statusVariant: 'default' },
];

const statusOptions = {
    'In Progress': 'default',
    'Completed': 'secondary',
    'Alert': 'destructive',
    'Planned': 'outline',
};

type MissionStatus = keyof typeof statusOptions;

export default function MissionsPage() {
  const mapThumbnail = PlaceHolderImages.find(p => p.id === 'mission-map-thumbnail');
  const [missions, setMissions] = useState(initialMissions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionStatus, setNewMissionStatus] = useState<MissionStatus>('Planned');


  const handleAddMission = () => {
    if (!newMissionTitle) return;

    const newMission = {
      id: missions.length > 0 ? Math.max(...missions.map(m => m.id)) + 1 : 1,
      title: newMissionTitle,
      status: newMissionStatus,
      statusVariant: statusOptions[newMissionStatus],
    };

    setMissions([...missions, newMission]);
    setNewMissionTitle('');
    setNewMissionStatus('Planned');
    setDialogOpen(false);
  };
  
  const handleDeleteMission = (missionId: number) => {
    setMissions(missions.filter(mission => mission.id !== missionId));
  };


  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-semibold font-headline">Missions</h1>
            <p className="text-muted-foreground">
            Overview of all autonomous vehicle missions.
            </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Add Mission
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Mission</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new mission.
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
                            placeholder="e.g., Zulu-1 Perimeter Scan"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                            Status
                        </Label>
                         <Select onValueChange={(value: MissionStatus) => setNewMissionStatus(value)} defaultValue={newMissionStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(statusOptions).map(status => (
                                     <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddMission}>Create Mission</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
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
                      <AlertDialogAction onClick={() => handleDeleteMission(mission.id)}>
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
      </div>
    </div>
  );
}
