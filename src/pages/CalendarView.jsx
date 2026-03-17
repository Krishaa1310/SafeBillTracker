import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card } from "../components/ui/Card";

export default function CalendarView() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const fetchReminders = async () => {
      const token = localStorage.getItem("safebill_token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/api/reminders", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setReminders(data);
        }
      } catch (e) {
        console.error("Failed to fetch reminders for calendar:", e);
      }
    };
    fetchReminders();
  }, []);

  // Map reminders to FullCalendar events
  const events = reminders.map((reminder) => {
    let color = "#3b82f6"; // Default Blue
    if (reminder.status === "completed") {
      color = "#94a3b8"; // Slate for completed
    } else {
      switch (reminder.category) {
        case "Credit Card":
          color = "#3b82f6"; // Blue
          break;
        case "EMI":
          color = "#10b981"; // Emerald
          break;
        case "Subscription":
          color = "#a855f7"; // Purple
          break;
        case "Insurance":
          color = "#f59e0b"; // Amber
          break;
        default:
          color = "#64748b";
      }
    }

    return {
      id: reminder.id,
      title: `${reminder.title} (₹${reminder.amount})`,
      start: reminder.dueDate,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      className: reminder.status === "completed" ? "opacity-50 line-through" : "",
    };
  });

  return (
    <div className="space-y-6 h-full flex flex-col pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Visual overview of your upcoming payments and due dates.
        </p>
      </div>

      <Card className="p-4 flex-1 min-h-[600px] overflow-hidden text-foreground bg-card">
        <style dangerouslySetInnerHTML={{__html: `
          .fc {
            --fc-page-bg-color: transparent;
            --fc-neutral-bg-color: var(--secondary);
            --fc-neutral-text-color: var(--foreground);
            --fc-border-color: var(--border);
            
            --fc-button-text-color: var(--primary-foreground);
            --fc-button-bg-color: var(--primary);
            --fc-button-border-color: var(--primary);
            --fc-button-hover-bg-color: var(--primary);
            --fc-button-hover-border-color: var(--primary);
            --fc-button-active-bg-color: var(--primary);
            --fc-button-active-border-color: var(--primary);
            
            --fc-event-bg-color: var(--primary);
            --fc-event-border-color: var(--primary);
            --fc-event-text-color: #ffffff;
            --fc-event-selected-overlay-color: rgba(0, 0, 0, 0.25);
            
            --fc-more-link-text-color: var(--primary);
            --fc-more-link-bg-color: var(--secondary);
            
            --fc-highlight-color: var(--accent);
            --fc-today-bg-color: var(--accent);
            --fc-now-indicator-color: var(--destructive);
          }
          
          .fc-theme-standard .fc-scrollgrid {
            border-color: var(--border);
          }
          
          /* Force text color for generic things that FullCalendar might miss in dark mode */
          .fc-col-header-cell-cushion, 
          .fc-daygrid-day-number, 
          .fc-list-day-text, 
          .fc-list-day-side-text, 
          .fc-toolbar-title {
            color: var(--foreground) !important;
            text-decoration: none;
          }

          .fc-button-primary {
            opacity: 0.9;
          }
          
          .fc-button-primary:not(:disabled):active, .fc-button-primary:not(:disabled).fc-button-active {
            opacity: 1;
          }
          .fc-day-today {
            background-color: var(--accent) !important;
          }
          .fc-event {
            cursor: pointer;
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.75rem;
          }
        `}} />
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          eventClick={(info) => {
            alert(`Event: ${info.event.title}\nDue: ${info.event.startStr}`);
          }}
        />
      </Card>
    </div>
  );
}
