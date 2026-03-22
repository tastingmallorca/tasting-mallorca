'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Ticket,
  User,
  Settings,
  LogOut,
  Users,
  Mountain,
  X,
  Hotel,
  MapPin,
  QrCode,
  Briefcase,
  Newspaper,
  MessageSquareHeart,
  Wrench,
  Map,
} from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '../ui/sheet';
import React from 'react';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton';

const navItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Ticket },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const adminNavGroups = [
  {
    title: 'Core Catalog',
    items: [
      { href: '/dashboard/admin/tours', label: 'Tours', icon: Mountain },
      { href: '/dashboard/admin/private-tours', label: 'Private Tours', icon: Briefcase },
      { href: '/dashboard/admin/destinations', label: 'Destinations', icon: Map },
    ]
  },
  {
    title: 'Content & Communication',
    items: [
      { href: '/dashboard/admin/blog', label: 'Blog & Articles', icon: Newspaper },
      { href: '/dashboard/admin/guest-feedback', label: 'Guest Feedback', icon: MessageSquareHeart },
    ]
  },
  {
    title: 'Operations & Users',
    items: [
      { href: '/dashboard/admin/meeting-points', label: 'Meeting Points', icon: MapPin },
      { href: '/dashboard/admin/hotels', label: 'Partner Hotels', icon: Hotel },
      { href: '/dashboard/users', label: 'User Directory', icon: Users },
    ]
  }
];

const guideNavItems = [
  { href: '/dashboard/guide/validate-ticket', label: 'Validate Ticket', roles: ['guide', 'admin'] }
]

const bottomNavItems = [
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings }, // Modified href for Settings
  { href: '/dashboard/admin/tools', label: 'Tools', icon: Wrench }, // Added Tools link
];

interface DashboardSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: DashboardSidebarProps) {
  const pathname = usePathname();
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const lang = pathname.split('/')[1] || 'en';

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`/${lang}/`);
    }
  };

  const userRole = user?.customClaims?.role;

  const SidebarContent = () => (
    <>
      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-2 p-4">
          {navItems.map((item) => {
            const href = `/${lang}${item.href}`;
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                asChild
                variant={pathname.startsWith(href) ? 'secondary' : 'ghost'}
                className="w-full justify-start text-base"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href={href}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          {userRole === 'admin' && adminNavGroups.map((group) => (
            <div key={group.title} className="mb-6 mt-6">
              <h4 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const href = `/${lang}${item.href}`;
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={pathname.startsWith(href) ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-base"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href={href}>
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          {guideNavItems.map((item) => {
            const href = `/${lang}${item.href}`;
            const Icon = QrCode;
            if (userRole && item.roles.includes(userRole)) {
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={pathname.startsWith(href) ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-base"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href={href}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </Button>
              );
            }
            return null;
          })}
        </nav>
      </div>
      <div className="mt-auto flex flex-col gap-2 border-t p-4">
        {bottomNavItems.map((item) => {
          const href = `/${lang}${item.href}`;
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              asChild
              variant={pathname.startsWith(href) ? 'secondary' : 'ghost'}
              className="w-full justify-start text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link href={href}>
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          );
        })}
        <Button variant="ghost" className="w-full justify-start text-base" onClick={handleSignOut}>
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 flex-col border-r bg-card md:flex shrink-0">
        <div className="flex h-20 items-center border-b px-6">
          <Link href={`/${lang}/`} className="flex items-center gap-0 font-semibold">
            <div className="relative h-14 w-14">
              <ImageWithSkeleton
                src="https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Fbranding%2FICONO-AZUL.png?alt=media&token=5f6b7c16-5a14-4d45-bbdb-f3a70138e8b7"
                alt="Tasting Mallorca Logo"
                fill
                className="object-contain"
                sizes="56px"
              />
            </div>
            <span className="text-xl font-bold text-foreground">Tasting Mallorca</span>
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="flex w-72 flex-col bg-card p-0">
          <SheetHeader className="flex h-20 flex-row items-center justify-between border-b px-6">
            <SheetTitle className='sr-only'>Main Menu</SheetTitle>
            <Link href={`/${lang}/`} className="flex items-center gap-0 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative h-12 w-12">
                <ImageWithSkeleton
                  src="https://firebasestorage.googleapis.com/v0/b/tasting-mallorca.firebasestorage.app/o/web%2Fbranding%2FICONO-AZUL.png?alt=media&token=5f6b7c16-5a14-4d45-bbdb-f3a70138e8b7"
                  alt="Tasting Mallorca Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <span className="text-xl font-bold text-foreground">Tasting Mallorca</span>
            </Link>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

