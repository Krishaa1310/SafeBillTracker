import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Pencil, Check, X } from "lucide-react";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveName = async () => {
    setError("");
    if (!editNameValue.trim()) {
      setError("Username cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      await updateProfile(editNameValue);
      setIsEditingName(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
      setEditNameValue(user?.name || ""); // Reset on failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditNameValue(user?.name || "");
    setError("");
  };

  return (
    <div className="space-y-6 max-w-2xl flex flex-col min-h-[calc(100vh-8rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and account.</p>
      </div>

      <div className="space-y-8 py-4 flex-grow">
        
        {/* Profile Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Profile</h2>
          <div className="p-4 border border-border rounded-lg bg-card space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                {!isEditingName && (
                  <button 
                    onClick={() => {
                      setEditNameValue(user?.name || "");
                      setIsEditingName(true);
                      setError("");
                    }}
                    className="text-xs flex items-center gap-1 text-primary hover:underline"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>
              
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="text" 
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex-1"
                    placeholder="Enter new username"
                    autoFocus
                    disabled={isSaving}
                  />
                  <button 
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="font-semibold text-foreground">{user?.name || "Not provided"}</p>
              )}
              {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">{user?.email || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Global Settings Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
            <div>
              <h3 className="font-semibold">Theme Mode</h3>
              <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              {theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Account</h2>
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5 flex items-center justify-between">
             <div>
              <h3 className="font-semibold text-destructive">Sign Out</h3>
              <p className="text-sm text-destructive/80">Log out of your account on this device</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-border flex justify-center pb-4">
        <a href="#terms" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
          Terms and Conditions
        </a>
      </div>
    </div>
  );
}
