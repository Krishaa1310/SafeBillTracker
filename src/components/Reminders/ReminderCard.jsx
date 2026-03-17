import React from "react";
import { 
  CreditCard, 
  Home, 
  RefreshCcw, 
  ShieldCheck, 
  Check, 
  Trash2,
  CalendarDays
} from "lucide-react";
import { cn } from "../../lib/utils";

const CATEGORY_ICONS = {
  "Credit Card": CreditCard,
  "EMI": Home,
  "Subscription": RefreshCcw,
  "Insurance": ShieldCheck,
};

const CATEGORY_COLORS = {
  "Credit Card": "text-blue-500 bg-blue-500/10 border-blue-500/20",
  "EMI": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  "Subscription": "text-purple-500 bg-purple-500/10 border-purple-500/20",
  "Insurance": "text-amber-500 bg-amber-500/10 border-amber-500/20",
};

export function ReminderCard({ reminder, onComplete, onDelete }) {
  const Icon = CATEGORY_ICONS[reminder.category] || CreditCard;
  const colorClass = CATEGORY_COLORS[reminder.category] || CATEGORY_COLORS["Credit Card"];
  
  const isCompleted = reminder.status === "completed";

  return (
    <div 
      className={cn(
        "group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-xl border bg-card transition-all hover:shadow-md",
        isCompleted ? "opacity-60 grayscale-[0.5] border-border/50" : "border-border",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl border flex-shrink-0", colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className={cn("font-semibold text-lg leading-none", isCompleted && "line-through text-muted-foreground")}>
            {reminder.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1 font-medium bg-secondary px-2 py-0.5 rounded-full text-xs text-foreground">
              {reminder.category}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(reminder.dueDate).toLocaleDateString()}
            </span>
            <span className="capitalize hidden sm:inline-block">
              • {reminder.frequency}
            </span>
          </div>
          {reminder.notes && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-1 italic">
              "{reminder.notes}"
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border gap-4">
        <div className="text-xl font-bold">
          ₹{Number(reminder.amount).toLocaleString()}
        </div>
        <div className="flex gap-2">
          {!isCompleted && (
            <button
              onClick={() => onComplete(reminder.id)}
              className="p-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-full transition-colors"
              title="Mark as Paid"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-0"
            title="Delete Reminder"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
