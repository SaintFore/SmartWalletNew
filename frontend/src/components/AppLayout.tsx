import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <header className="flex h-14 items-center gap-2 border-b border-border/50 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">SmartWallet</span>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}
