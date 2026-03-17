import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set this to your backend URL base
  const API_BASE_URL = "http://localhost:5000/api/auth";

  useEffect(() => {
    // Check local storage for existing session
    const checkSession = async () => {
      const token = localStorage.getItem("safebill_token");
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/me`, {
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
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to login");
    }

    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("safebill_token", data.token);
    return true;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("safebill_token");
  };

  const toggleEmailReminders = async (enabled) => {
    const token = localStorage.getItem("safebill_token");
    if (!token) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/preferences`, {
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

    const res = await fetch(`${API_BASE_URL}/profile`, {
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
    <AuthContext.Provider value={{ user, login, register, logout, loading, toggleEmailReminders, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
