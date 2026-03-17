import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Bell, Calendar as CalendarIcon, PieChart, Settings, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Reminders", href: "/reminders", icon: Bell },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Portfolio", href: "/portfolio", icon: PieChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ className }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div
      className={cn(
        "pb-12 border-r border-border bg-card min-h-screen flex flex-col w-64 hidden md:flex",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-2xl font-bold tracking-tight text-primary">
            SmartBill
          </h2>
          <div className="space-y-1 mt-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  location.pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-auto px-4 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
