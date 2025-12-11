import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import Image from 'next/image';
import { Network, MapPin, Radar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function LandingPage() {
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
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://picsum.photos/seed/1/1200/800"
              alt="Blurred background image 1"
              layout="fill"
              objectFit="cover"
              className="opacity-10 blur-2xl"
              data-ai-hint="abstract technology"
            />
             <Image
              src="https://picsum.photos/seed/2/1200/800"
              alt="Blurred background image 2"
              layout="fill"
              objectFit="cover"
              className="opacity-10 blur-2xl"
              style={{ mixBlendMode: 'overlay' }}
               data-ai-hint="abstract lines"
            />
          </div>
          <div className="container relative z-10 px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
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
               <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzb2Z0d2FyZSUyMHRlYW18ZW58MHx8fHwxNzE3MjEwODI4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                data-ai-hint="futuristic car interface"
              />
            </div>
          </div>
        </section>

        <section className="w-full bg-background py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Advanced Threat Detection Capabilities</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform identifies and mitigates critical security risks for autonomous vehicles, ensuring safe and reliable operation. We provide deep analysis into network, navigation, and sensor-based threats.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <Card className="text-center">
                <CardHeader className="items-center">
                  <Network className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">Sybil Attack Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    A Sybil attack creates multiple fake vehicle identities to disrupt vehicle-to-vehicle (V2V) communication networks. This can lead to phantom traffic jams, incorrect routing, and even coordinated system failures.
                  </p>
                   <p className="text-sm font-medium">
                    ThreatWatch AV analyzes communication patterns and message frequencies to identify and neutralize these fake nodes in real-time, preserving network integrity and ensuring reliable V2V data exchange.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <MapPin className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">GPS Spoofing Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                   <p className="text-sm text-muted-foreground">
                    GPS spoofing transmits false satellite signals to trick an AV into thinking it's somewhere it isn't. This can cause the vehicle to drive off-road, into oncoming traffic, or into other dangerous situations.
                  </p>
                   <p className="text-sm font-medium">
                    Our system cross-references GPS data with inertial measurement units (IMU), cellular positioning, and other sensors to detect signal anomalies and alert the system to a potential spoofing event, ensuring safe and accurate navigation.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader className="items-center">
                  <Radar className="h-10 w-10 text-primary" />
                  <CardTitle className="mt-4">Sensor Spoofing Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This sophisticated attack involves feeding false data to an AV's critical sensors (like LiDAR, cameras, or radar) to make it perceive phantom obstacles or, more dangerously, ignore real ones.
                  </p>
                  <p className="text-sm font-medium">
                    ThreatWatch AV uses advanced machine learning algorithms to find inconsistencies across multiple sensor inputs, identifying and flagging manipulated data to prevent catastrophic accidents and ensure the vehicle perceives its true environment.
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
