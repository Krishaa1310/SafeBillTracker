import React, { useState, useEffect } from "react";
import { Plus, Filter } from "lucide-react";
import { ReminderCard } from "../components/Reminders/ReminderCard";
import { AddReminderModal } from "../components/Reminders/AddReminderModal";

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Credit Card", "EMI", "Subscription", "Insurance"];

  const API_BASE_URL = "http://localhost:5000/api/reminders";

  const fetchReminders = async () => {
    const token = localStorage.getItem("safebill_token");
    if (!token) return;
    try {
      const res = await fetch(API_BASE_URL, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (e) {
      console.error("Failed to fetch reminders:", e);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAddReminder = async (newReminder) => {
    const token = localStorage.getItem("safebill_token");
    try {
      const res = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newReminder)
      });
      if (res.ok) fetchReminders();
    } catch (e) {
      console.error("Failed to add reminder:", e);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("safebill_token");
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchReminders();
    } catch (e) {
      console.error("Failed to delete reminder:", e);
    }
  };

  const handleComplete = async (id) => {
    const token = localStorage.getItem("safebill_token");
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "completed" })
      });
      if (res.ok) fetchReminders();
    } catch (e) {
      console.error("Failed to update reminder status:", e);
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
        {filteredReminders.length === 0 ? (
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
