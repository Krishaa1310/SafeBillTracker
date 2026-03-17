import React, { useState, useEffect } from "react";
import { X, ArrowRightLeft, RefreshCw, AlertCircle } from "lucide-react";

export function CurrencyConverterModal({ isOpen, onClose }) {
  const [amountInr, setAmountInr] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("USD");
  const [conversionResult, setConversionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && !exchangeRates) {
      fetchRates();
    }
  }, [isOpen]);

  const fetchRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Using a free, public API that doesn't require keys for basic usage
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
      if (!res.ok) throw new Error("Failed to fetch rates");
      const data = await res.json();
      setExchangeRates(data.rates);
    } catch (err) {
      console.error(err);
      setError("Unable to load latest exchange rates. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = (e) => {
    e.preventDefault();
    if (!amountInr || isNaN(amountInr) || !exchangeRates) return;

    const rate = exchangeRates[targetCurrency];
    const result = parseFloat(amountInr) * rate;
    setConversionResult(result.toFixed(2));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 text-primary">
            <ArrowRightLeft className="h-5 w-5" />
            <h2 className="text-xl font-bold">Currency Converter</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleConvert} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Amount in Rupees (INR)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  ₹
                </div>
                <input
                  type="number"
                  placeholder="1000"
                  step="0.01"
                  min="0"
                  required
                  value={amountInr}
                  onChange={(e) => {
                    setAmountInr(e.target.value);
                    setConversionResult(null); // Reset result on typing
                  }}
                  className="w-full rounded-lg border border-input bg-background px-10 py-3 text-lg ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Convert To
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTargetCurrency("USD");
                    setConversionResult(null);
                  }}
                  className={`py-3 rounded-lg font-medium border transition-all ${
                    targetCurrency === "USD" 
                      ? "bg-primary text-primary-foreground border-primary shadow-md" 
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  US Dollars ($)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetCurrency("EUR");
                    setConversionResult(null);
                  }}
                  className={`py-3 rounded-lg font-medium border transition-all ${
                    targetCurrency === "EUR" 
                      ? "bg-primary text-primary-foreground border-primary shadow-md" 
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  Euros (€)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !amountInr || !exchangeRates}
              className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-lg font-bold hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all disabled:opacity-50 shadow-md mt-6"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Loading Rates...
                </>
              ) : (
                "Convert"
              )}
            </button>
          </form>

          {/* Result Section */}
          <div 
            className={`mt-6 overflow-hidden transition-all duration-300 ease-in-out ${
              conversionResult ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex flex-col items-center justify-center shadow-inner">
              <span className="text-sm text-muted-foreground mb-1">Converted Amount</span>
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {targetCurrency === "USD" ? "$" : "€"}{conversionResult} {targetCurrency}
              </div>
              <div className="text-xs text-muted-foreground mt-2 font-medium">
                ₹{amountInr} = {targetCurrency === "USD" ? "$" : "€"}{conversionResult} {targetCurrency}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center italic">
            <p>Exchange rates are approximate and may vary.</p>
            {exchangeRates && (
              <p className="mt-1 text-[10px] opacity-70">
                1 INR = {exchangeRates[targetCurrency]} {targetCurrency}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
