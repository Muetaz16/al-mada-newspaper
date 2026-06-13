'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Plus, 
  Radio,
  BarChart3,
  Video,
  Film,
  PieChart,
  Heart,
  Users as UsersIcon,
  Tv,
  Mic
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { canManageUsers, getRoleLabel } from '@/utils/permissions';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: 'لوحة التحكم',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'الأخبار',
    url: '/news',
    icon: FileText,
  },
  {
    title: 'البث المباشر',
    url: '/live',
    icon: Tv,
  },
  {
    title: 'نبض الحياة',
    url: '/pulse-of-life',
    icon: Heart,
  },
  {
    title: 'بإيجاز (ريلز)',
    url: '/reels',
    icon: Film,
  },
  {
    title: 'الأقسام',
    url: '/categories',
    icon: Layers,
  },
  {
    title: 'فيديو و ريلز',
    url: '/videos',
    icon: Video,
  },
  {
    title: 'الاستبيانات',
    url: '/polls',
    icon: PieChart,
  },
  {
    title: 'الأخبار السريعة',
    url: '/breaking-news',
    icon: Radio,
  },
  {
    title: 'أبعد مدى (المقالات)',
    url: '/analyses',
    icon: Layers,
  },
  {
    title: 'البودكاست',
    url: '/podcasts',
    icon: Mic,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const visibleMenuItems = React.useMemo(() => {
    const items = [...menuItems];
    if (user && canManageUsers(user)) {
      items.push({
        title: 'إدارة المستخدمين',
        url: '/users',
        icon: UsersIcon,
      });
    }
    return items;
  }, [user]);

  return (
    <Sidebar className="border-e border-white/5 bg-slate-950/95 backdrop-blur-xl text-slate-200" side="right">
      <SidebarHeader className="h-24 flex items-center justify-center border-b border-white/5 px-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full">
          <div className="bg-primary/20 p-2 rounded-2xl border border-primary/20">
            <Radio className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" />
          </div>
          <div className="flex flex-col text-start">
            <span className="text-xl font-black tracking-tight text-white leading-none">
              صحيفة المدى
            </span>
            <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest">إدارة المحتوى</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {user && (
          <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1 text-start">
            <span className="text-xs font-black text-slate-400">مرحباً، {user.name || 'محرر المدى'}</span>
            <span className="text-[10px] font-bold text-primary truncate max-w-full">
              {getRoleLabel(user.role)}
            </span>
          </div>
        )}

        <div className="px-2">
          <Button 
            render={<Link href="/news/create" />}
            className="w-full h-12 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-5 h-5" />
            خبر جديد
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-[10px] font-black px-4 mb-4 uppercase tracking-[0.2em] text-start">
            القائمة الرئيسية
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {visibleMenuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={
                        <Link 
                          href={item.url} 
                          className={`
                            flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group
                            ${isActive 
                              ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]' 
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                          `}
                        >
                          <div className={`
                            p-2 rounded-xl transition-all duration-300
                            ${isActive ? 'bg-primary/20 text-primary' : 'bg-transparent group-hover:bg-white/5'}
                          `}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm">{item.title}</span>
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group font-bold text-sm"
        >
          <div className="p-2 rounded-xl bg-transparent group-hover:bg-red-500/20">
            <LogOut className="w-5 h-5" />
          </div>
          <span>تسجيل الخروج</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
