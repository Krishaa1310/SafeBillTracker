import React, { useState } from "react";
import { Plus, X } from "lucide-react";

export function AddStockModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    quantity: "",
    buyPrice: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      id: Date.now().toString(),
      currentPrice: formData.buyPrice, // Initial current price same as buy price
      addedAt: new Date().toISOString(),
    });
    setFormData({ symbol: "", name: "", quantity: "", buyPrice: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Add New Stock</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Symbol *</label>
              <input
                type="text"
                name="symbol"
                required
                value={formData.symbol}
                onChange={handleChange}
                className="w-full p-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                placeholder="AAPL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Apple Inc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity *</label>
              <input
                type="number"
                name="quantity"
                required
                min="0.01"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Buy Price (₹) *</label>
              <input
                type="number"
                name="buyPrice"
                required
                min="0.01"
                step="0.01"
                value={formData.buyPrice}
                onChange={handleChange}
                className="w-full p-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="150.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
