import {
  BarChart3,
  DollarSign,
  Home,
  PieChart,
  Table2,
  Wallet,
  WalletCards,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/shared/ui/sidebar";

const menuItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/categories", label: "Categories", icon: PieChart },
  { path: "/accounts", label: "Accounts", icon: WalletCards },
  { path: "/transactions", label: "Transactions", icon: DollarSign },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/spreadsheet", label: "Spreadsheet", icon: Table2 },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary shadow-inner">
            <Wallet className="size-5" />
          </div>
          <div>
            <span className="font-semibold text-lg leading-none">SmartWallet</span>
            <p className="text-xs text-muted-foreground">Spend with clarity</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} className="h-10 rounded-xl">
                      <Link to={item.path}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="mx-2 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-3 text-xs text-muted-foreground">
          Built for clear daily money decisions.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
