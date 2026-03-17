import React, { useState, useMemo } from "react";
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { AddStockModal } from "../components/Portfolio/AddStockModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Portfolio() {
  const [stocks, setStocks] = useLocalStorage("smartbill-stocks", []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddStock = (newStock) => {
    setStocks([...stocks, newStock]);
  };

  const handleUpdatePrice = (id, newPrice) => {
    setStocks(
      stocks.map((s) => (s.id === id ? { ...s, currentPrice: newPrice } : s))
    );
  };

  const handleDelete = (id) => {
    setStocks(stocks.filter((s) => s.id !== id));
  };

  // Calculate portfolio metrics
  const { totalInvested, totalCurrentValue, totalProfitLoss, profitLossPercentage } = useMemo(() => {
    let invested = 0;
    let current = 0;

    stocks.forEach((s) => {
      const q = Number(s.quantity);
      invested += Number(s.buyPrice) * q;
      current += Number(s.currentPrice || s.buyPrice) * q;
    });

    const pl = current - invested;
    const plPerc = invested > 0 ? (pl / invested) * 100 : 0;

    return {
      totalInvested: invested,
      totalCurrentValue: current,
      totalProfitLoss: pl,
      profitLossPercentage: plPerc,
    };
  }, [stocks]);

  // Data for chart
  const chartData = useMemo(() => {
    return stocks.map(s => ({
      name: s.symbol.toUpperCase(),
      value: Number(s.currentPrice || s.buyPrice) * Number(s.quantity)
    })).filter(s => s.value > 0);
  }, [stocks]);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Track your investments and performance manually.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Stock
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInvested.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCurrentValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-emerald-500" : "text-destructive"}`}>
              {totalProfitLoss >= 0 ? "+" : ""}₹{totalProfitLoss.toFixed(2)}
            </div>
            <p className={`text-xs mt-1 ${totalProfitLoss >= 0 ? "text-emerald-500/80" : "text-destructive/80"}`}>
              {totalProfitLoss >= 0 ? "+" : ""}{profitLossPercentage.toFixed(2)}% All time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {stocks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No stocks added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground bg-secondary/50 uppercase border-b border-border">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Asset</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Avg Price</th>
                      <th className="px-4 py-3">Curr Price</th>
                      <th className="px-4 py-3">Total Value</th>
                      <th className="px-4 py-3 rounded-tr-lg text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((stock) => {
                      const invested = Number(stock.buyPrice) * Number(stock.quantity);
                      const current = Number(stock.currentPrice) * Number(stock.quantity);
                      const pl = current - invested;
                      const isProfit = pl >= 0;

                      return (
                        <tr key={stock.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold">{stock.symbol.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">{stock.name}</div>
                          </td>
                          <td className="px-4 py-3 font-medium">{stock.quantity}</td>
                          <td className="px-4 py-3">₹{Number(stock.buyPrice).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              ₹
                              <input
                                type="number"
                                className="w-20 p-1 text-sm bg-background border border-input rounded flex-1 focus:outline-none focus:ring-1 focus:ring-ring"
                                value={stock.currentPrice}
                                onChange={(e) => handleUpdatePrice(stock.id, e.target.value)}
                                step="any"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">₹{current.toFixed(2)}</div>
                            <div className={`text-xs ${isProfit ? "text-emerald-500" : "text-destructive"}`}>
                              {isProfit ? "+" : ""}{pl.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(stock.id)}
                              className="text-destructive hover:text-destructive/80 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                No data for chart
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStock}
      />
    </div>
  );
}
