'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TreePine, Search, Download, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tree', label: 'Tree', icon: TreePine },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/print', label: 'Print', icon: Download },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-h-[56px] min-w-[56px] px-3 py-2 text-[11px] rounded-lg transition-colors',
                active ? 'text-indigo-600' : 'text-gray-500'
              )}
            >
              <item.icon className={cn('h-5 w-5', active && 'text-indigo-600')} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
