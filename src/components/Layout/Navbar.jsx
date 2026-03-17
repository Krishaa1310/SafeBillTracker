import React from "react";
import { Link } from "react-router-dom";
import { CalendarHeart, Moon, Sun, Menu, Banknote } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { CurrencyConverterModal } from "../CurrencyConverter/CurrencyConverterModal";

export function Navbar({ toggleMobileSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const [isConverterOpen, setIsConverterOpen] = React.useState(false);

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto md:px-6">
        <button
          className="md:hidden mr-2 p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        <div className="flex items-center gap-2 font-semibold md:hidden">
          <span className="text-xl text-primary font-bold">SmartBill</span>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Link
            to="/calendar"
            className="p-2 border border-border rounded-full hover:bg-accent transition-colors"
            title="View Calendar"
          >
            <CalendarHeart className="h-5 w-5 text-primary" />
            <span className="sr-only">Calendar</span>
          </Link>

          <button
            onClick={() => setIsConverterOpen(true)}
            className="p-2 border border-border rounded-full hover:bg-accent transition-colors text-emerald-500"
            title="Currency Converter"
          >
            <Banknote className="h-5 w-5" />
            <span className="sr-only">Currency Converter</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 border border-border rounded-full hover:bg-accent transition-colors"
            title="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle Theme</span>
          </button>
        </div>
      </div>

      <CurrencyConverterModal 
        isOpen={isConverterOpen} 
        onClose={() => setIsConverterOpen(false)} 
      />
    </nav>
  );
}
