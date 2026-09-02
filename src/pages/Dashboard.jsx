import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { 
  CreditCard, 
  RefreshCcw, 
  Home, 
  ShieldCheck, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { DashboardCharts } from "../components/Dashboard/DashboardCharts";
import { isBefore, isToday, addDays, parseISO } from "date-fns";

import { API_BASE_URL } from "../config";

const CATEGORY_ICONS = {
  "Credit Card": CreditCard,
  "EMI": Home,
  "Subscription": RefreshCcw,
  "Insurance": ShieldCheck,
};

export default function Dashboard() {
  const { user, toggleEmailReminders } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [stocks = []] = useLocalStorage("smartbill-stocks", []);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem("safebill_token");
        const res = await fetch(`${API_BASE_URL}/reminders`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setReminders(data);
        }
      } catch (err) {
        console.error("Failed to fetch reminders:", err);
      }
    };
    fetchReminders();
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const next7Days = addDays(today, 7);
    
    let totalObligations = 0;
    let upcomingCount = 0;
    let overdueCount = 0;

    reminders.forEach(r => {
      const amount = Number(r.amount) || 0;
      totalObligations += amount;

      if (!r.dueDate) return;
      const dueDate = parseISO(r.dueDate);

      if (isBefore(dueDate, today) && !isToday(dueDate)) {
        overdueCount++;
      } else if (isBefore(dueDate, next7Days)) {
        upcomingCount++;
      }
    });

    let portfolioValue = 0;
    stocks.forEach(s => {
      const currentPrice = Number(s.currentPrice) || Number(s.buyPrice) || 0;
      const quantity = Number(s.quantity) || 0;
      portfolioValue += currentPrice * quantity;
    });

    return { totalObligations, upcomingCount, overdueCount, portfolioValue };
  }, [reminders, stocks]);

  // Get next 5 upcoming
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    return reminders
      .filter(r => r.dueDate && (isToday(parseISO(r.dueDate)) || isBefore(today, parseISO(r.dueDate))))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [reminders]);


  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your finances today.
          </p>
        </div>
        
        {user && (
          <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl border border-border/50 shadow-sm animate-in fade-in zoom-in">
             <div className="text-sm">
               <span className="font-semibold block leading-none mb-1">Email Reminders</span>
               <span className="text-muted-foreground text-xs">{user.email_reminders_enabled ? "Active" : "Disabled"}</span>
             </div>
             <button 
               onClick={() => toggleEmailReminders(!user.email_reminders_enabled)}
               className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.email_reminders_enabled ? 'bg-primary' : 'bg-muted'}`}
               aria-label="Toggle Email Reminders"
             >
               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.email_reminders_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Obligations</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalObligations.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground text-emerald-500 mt-1">
              Active tracked payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Payments due soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1 text-destructive/80">
              Requires immediate action
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.portfolioValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total investments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <DashboardCharts reminders={reminders} />
        </div>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-sm text-muted-foreground">No upcoming payments.</p>
               </div>
            ) : (
              <div className="space-y-4 text-sm mt-2">
                {upcomingReminders.map(r => {
                  const Icon = CATEGORY_ICONS[r.category] || CreditCard;
                  return (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20 transition-all hover:bg-secondary/40">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-full">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium leading-none">{r.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.category} • Due: {new Date(r.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="font-semibold px-3 py-1 bg-background rounded-full border border-border/50 shadow-sm text-foreground">
                        ₹{Number(r.amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
