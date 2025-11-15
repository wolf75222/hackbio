'use client';

import { Home, TrendingUp, DollarSign, FileText, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    icon: Home,
    label: 'Tableau de Bord',
    href: '/dashboard',
  },
  {
    icon: TrendingUp,
    label: 'Ma Rentabilité',
    href: '/dashboard/rentabilite',
  },
  {
    icon: DollarSign,
    label: 'Ma Trésorerie',
    href: '/dashboard/tresorerie',
  },
  {
    icon: FileText,
    label: 'Mes Flux de Trésorerie',
    href: '/dashboard/flux',
  },
  {
    icon: Settings,
    label: 'Ma Gestion',
    href: '/dashboard/gestion',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Économie</h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 w-full transition-colors">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold">Utilisateur</div>
            <div className="text-xs text-gray-500">Mon profil</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
