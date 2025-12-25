'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  LayoutDashboard,
  MapPin,
  Network,
  Radar,
  Rocket,
  History,
  User,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/sybil-detection', icon: Network, label: 'Sybil Detection' },
  // { href: '/dashboard/gps-spoofing', icon: MapPin, label: 'GPS Spoofing' },
  // { href: '/dashboard/sensor-spoofing', icon: Radar, label: 'Sensor Spoofing' },
  { href: '/dashboard/missions', icon: Rocket, label: 'Missions' },
  { href: '/dashboard/logs', icon: FileText, label: 'System Logs' },
  { href: '/dashboard/history', icon: History, label: 'History' },
];

const secondaryNavItems = [
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
]

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <>
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.label}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
    <div className="mt-auto">
        <SidebarMenu>
            {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.label}
                    >
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    </div>
    </>
  );
}
