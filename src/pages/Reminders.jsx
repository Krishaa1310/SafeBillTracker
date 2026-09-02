import React, { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { ReminderCard } from "../components/Reminders/ReminderCard";
import { AddReminderModal } from "../components/Reminders/AddReminderModal";
import { API_BASE_URL } from "../config";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Credit Card", "EMI", "Subscription", "Insurance"];

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const token = localStorage.getItem("safebill_token");
        const res = await fetch(`${API_BASE_URL}/reminders`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch reminders");
        const data = await res.json();
        setReminders(data);
      } catch (err) {
        console.error("Failed to load reminders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  const handleAddReminder = async (newReminder) => {
    try {
      const token = localStorage.getItem("safebill_token");
      const res = await fetch(`${API_BASE_URL}/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReminder)
      });
      if (!res.ok) throw new Error("Failed to create reminder");
      setReminders(prev => [...prev, newReminder]);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to add reminder");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("safebill_token");
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to delete reminder");
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete reminder");
    }
  };

  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem("safebill_token");
      const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "completed" })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setReminders(prev => prev.map(r => r.id === id ? { ...r, status: "completed" } : r));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to complete reminder");
    }
  };

  // Sort by date (pending first, then completed)
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const filteredReminders = filter === "All" 
    ? sortedReminders 
    : sortedReminders.filter(r => r.category === filter);

  const totalPending = reminders.filter(r => r.status !== "completed").reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Manage your obligations. Total pending: <span className="font-semibold text-foreground">₹{totalPending.toFixed(2)}</span>
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Reminder
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <Filter className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat 
                ? "bg-foreground text-background" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-card/30 rounded-xl border border-border/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-card/50">
            <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No reminders found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              You don't have any {filter !== "All" ? filter.toLowerCase() : ""} reminders scheduled. Click the button above to add one.
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <AddReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddReminder}
      />
    </div>
  );
}
