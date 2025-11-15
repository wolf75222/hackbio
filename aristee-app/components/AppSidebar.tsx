'use client';

import { Home, Sparkles, Trees, Euro, UsersRound, FileText } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Menu items
const menuItems = [
  { icon: Home, label: 'Dashboard', href: '#dashboard' },
  { icon: Sparkles, label: 'IA', href: '#ia' },
  { icon: Trees, label: 'Chantiers', href: '/' },
  { icon: Euro, label: 'Économie', href: '#economie' },
  { icon: UsersRound, label: 'Coopérative', href: '#cooperative' },
  { icon: FileText, label: 'Documents', href: '#documents' },
];

export function AppSidebar() {
  return (
    <Sidebar>
      {/* Logo Aristée en haut */}
      <SidebarHeader className="p-4 flex items-center justify-center">
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="/ari.png"
            alt="Aristée"
            className="w-full h-full object-contain"
          />
        </div>
      </SidebarHeader>

      {/* Navigation principale */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = index === 2; // Chantiers is active (index 2)

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <a href={item.href} className="flex items-center justify-center">
                        <Icon className="text-[#14532d]" strokeWidth={2.5} />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer avec avatar utilisateur */}
      <SidebarFooter className="p-4 flex items-center justify-center">
        <Avatar className="h-10 w-10">
          <img
            src="/avatar.png"
            alt="User"
            className="w-full h-full object-cover rounded-full"
          />
        </Avatar>
      </SidebarFooter>
    </Sidebar>
  );
}
