'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TreePine, Search, Download, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditModeToggle } from '@/components/auth/EditModeToggle';
import { useApiStore } from '@/lib/api-store';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function TreeHeader({ slug }: { slug: string }) {
  const tree = useApiStore((s) => s.tree);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: `/tree/${slug}`, label: 'Family Tree', icon: TreePine },
    { href: `/tree/${slug}/search`, label: 'Search', icon: Search },
    { href: `/tree/${slug}/print`, label: 'Print', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
          <TreePine className="h-6 w-6" />
          <span className="hidden sm:inline">{tree?.name || 'Gentree'}</span>
          <span className="sm:hidden">Gentree</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'gap-2',
                  pathname === item.href && 'bg-indigo-50 text-indigo-700'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          <div className="ml-2">
            <EditModeToggle slug={slug} />
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <EditModeToggle slug={slug} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-white px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-2',
                  pathname === item.href && 'bg-indigo-50 text-indigo-700'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
