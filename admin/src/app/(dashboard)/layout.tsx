import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full overflow-hidden" dir="rtl">
        <AdminSidebar />
        <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-muted/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6">
            <SidebarTrigger className="hover:bg-muted rounded-xl transition-colors" />
            <div className="h-6 w-px bg-muted mx-2" />
            <h1 className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">لوحة التحكم</h1>
          </header>
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
