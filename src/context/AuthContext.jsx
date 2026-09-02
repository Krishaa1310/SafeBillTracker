import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the API URL from environment config
  const AUTH_API_URL = `${API_BASE_URL}/auth`;

  useEffect(() => {
    // Check local storage for existing session
    const checkSession = async () => {
      const token = localStorage.getItem("safebill_token");
      if (token) {
        try {
          const res = await fetch(`${AUTH_API_URL}/me`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem("safebill_token");
          }
        } catch (e) {
          console.error("Failed to verify token", e);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, [AUTH_API_URL]);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to login");
      }

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem("safebill_token", data.token);
      return true;
    } catch (err) {
      if (err.message === "Failed to fetch") {
        throw new Error(`Failed to connect to backend at ${AUTH_API_URL}/login. Please check if the backend server is running and accessible.`);
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to register");
      }

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem("safebill_token", data.token);
      return true;
    } catch (err) {
      if (err.message === "Failed to fetch") {
        throw new Error(`Failed to connect to backend at ${AUTH_API_URL}/register. Please check if the backend server is running and accessible.`);
      }
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await fetch(`${AUTH_API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to process request");
      }
      
      return true;
    } catch (err) {
      if (err.message === "Failed to fetch") {
        throw new Error(`Failed to connect to backend at ${AUTH_API_URL}/forgot-password. Please check if the backend server is running and accessible.`);
      }
      throw err;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const res = await fetch(`${AUTH_API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reset password");
      }
      
      return true;
    } catch (err) {
      if (err.message === "Failed to fetch") {
        throw new Error(`Failed to connect to backend at ${AUTH_API_URL}/reset-password. Please check if the backend server is running and accessible.`);
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("safebill_token");
  };

  const toggleEmailReminders = async (enabled) => {
    const token = localStorage.getItem("safebill_token");
    if (!token) return false;

    try {
      const res = await fetch(`${AUTH_API_URL}/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email_reminders_enabled: enabled })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(prev => ({ ...prev, email_reminders_enabled: data.email_reminders_enabled ? 1 : 0 }));
        return true;
      }
    } catch (e) {
      console.error("Failed to update preferences", e);
    }
    return false;
  };

  const updateProfile = async (name) => {
    const token = localStorage.getItem("safebill_token");
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${AUTH_API_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    const data = await res.json();
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, toggleEmailReminders, updateProfile, forgotPassword, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
