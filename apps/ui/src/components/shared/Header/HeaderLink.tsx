'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        'text-lg font-medium transition-all duration-300 hover:text-rose-500 hover:scale-105 transform',
        pathname === href ? 'text-rose-500' : 'text-zinc-400'
      )}
    >
      {children}
    </Link>
  );
}
