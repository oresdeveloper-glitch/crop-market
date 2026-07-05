import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white/80 dark:bg-navy-900/80 backdrop-blur-lg border-b border-navy-100 dark:border-navy-800">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {user && (
            <button onClick={onMenuToggle} className="p-1.5 rounded-lg text-navy-500 hover:text-navy-700 hover:bg-navy-100 dark:text-navy-400 dark:hover:text-navy-200 dark:hover:bg-navy-700 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-semibold text-sm text-navy-900 dark:text-white">Trust Market</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setOpen(!open)}
                className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center hover:ring-2 ring-primary-300 transition-all">
                <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </button>
              {open && (
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-navy-800 rounded-xl shadow-lg border border-navy-100 dark:border-navy-700 py-2">
                  <div className="px-4 py-2 border-b border-navy-100 dark:border-navy-700">
                    <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{user.fullName}</p>
                    <p className="text-xs text-navy-400">{user.role}</p>
                  </div>
                  <button onClick={() => { setOpen(false); toggle(); }}
                    className="w-full text-left px-4 py-2 text-sm text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-700">
                    {dark ? "☀️ Light mode" : "🌙 Dark mode"}
                  </button>
                  <button onClick={() => { setOpen(false); logout(); navigate("/login"); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-xs text-navy-500 font-medium">Sign in</Link>
              <Link to="/register" className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-medium">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
