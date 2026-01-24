'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import Image from 'next/image';
import { Network, MapPin, Radar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-4 lg:px-6">
        <Link href="#" className="flex items-center justify-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-semibold">ThreatWatch AV</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
          <Button asChild variant="ghost">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Real-Time Threat Detection for Autonomous Vehicles
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ThreatWatch AV provides a comprehensive suite of tools to
                    monitor, detect, and analyze security threats for autonomous
                    vehicle fleets.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
              <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-xl lg:order-last">
                {heroImage ? (
                  <Image
                    src={heroImage.imageUrl}
                    alt="A team of software developers working together"
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading image...</span>
                      </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full bg-background py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Advanced Threat Detection Capabilities
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform identifies and mitigates critical security risks
                for autonomous vehicles, ensuring safe and reliable operation.
                We provide deep analysis into network, navigation, and
                sensor-based threats.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Network className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">Sybil Attack Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    A Sybil attack creates multiple fake vehicle identities to
                    disrupt vehicle-to-vehicle (V2V) communication networks.
                    This can lead to phantom traffic jams, incorrect routing,
                    and even coordinated system failures.
                  </p>
                  <p className="text-sm font-medium">
                    ThreatWatch AV analyzes communication patterns and message
                    frequencies to identify and neutralize these fake nodes in
                    real-time, preserving network integrity and ensuring
                    reliable V2V data exchange.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center bg-muted/50">
                <CardHeader className="items-center">
                  <div className="rounded-full bg-muted p-4 text-muted-foreground">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">GPS Spoofing Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold text-muted-foreground">
                    Releasing Soon...
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <Radar className="h-8 w-8" />
                  </div>
                  <CardTitle className="mt-4">
                    Sensor Spoofing Detection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Sensor spoofing feeds false data to a vehicle's sensors (like LIDAR or cameras) to manipulate its perception of the environment, which can lead to dangerous driving decisions.
                    </p>
                    <p className="text-sm font-medium">
                      ThreatWatch AV uses machine learning to analyze sensor data for anomalies, comparing readings against expected values to detect spoofing attempts and safeguard the vehicle.
                    </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center p-6">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ThreatWatch AV. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
