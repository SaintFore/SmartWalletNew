import { Moon, Sun } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/shared/ui/separator";
import { useDarkMode } from "@/shared/lib/use-dark-mode";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { dark, toggle } = useDarkMode();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_32rem),linear-gradient(180deg,var(--background),var(--secondary))]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent" />
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/75 px-4 backdrop-blur-xl">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium">SmartWallet</span>
            <p className="truncate text-xs text-muted-foreground">Personal finance cockpit</p>
          </div>
          <button
            onClick={toggle}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>
        <div className="relative p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
