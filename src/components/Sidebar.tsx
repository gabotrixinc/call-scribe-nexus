
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  CircleUser,
  Cog,
  Contact,
  FileDown,
  Gauge,
  Bot,
  MessageCircle,
  Phone,
  User,
  Users,
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

type SidebarNavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    title: "Llamadas",
    href: "/calls",
    icon: Phone,
  },
  {
    title: "Conversaciones",
    href: "/conversations",
    icon: MessageCircle,
  },
  {
    title: "Contactos",
    href: "/contacts",
    icon: Users,
  },
  {
    title: "Mensajería",
    href: "/messaging",
    icon: MessageCircle,
  },
  {
    title: "Agentes",
    href: "/agents",
    icon: Bot,
  },
  {
    title: "Automatización",
    href: "/automation",
    icon: AreaChart,
  },
  {
    title: "Usuarios",
    href: "/users",
    icon: User,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: Cog,
  },
];

export default function Sidebar({ className }: { className?: string }) {
  const { isMobile, isCollapsed, setIsCollapsed } = useMobile();
  const location = useLocation();

  return (
    <div
      className={cn(
        "pb-12 border-r h-full transition-all ease-in-out duration-300",
        isCollapsed ? "w-[60px]" : "w-[230px] md:w-[230px]",
        className
      )}
    >
      <div className="space-y-6 py-4 px-2">
        <div className="px-2">
          <h2 className={cn("text-lg font-semibold flex items-center gap-2 tracking-tight", isCollapsed && "hidden")}>
            <CircleUser className="h-5 w-5" />
            <span>Acciones</span>
          </h2>
          <p className={cn("text-xs text-muted-foreground", isCollapsed && "hidden")}>
            Gestiona tu centro de contacto.
          </p>
        </div>
        <nav className="space-y-1 px-2">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "transparent",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
