import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./components/Layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Reminders from "./pages/Reminders";
import CalendarView from "./pages/CalendarView";
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
