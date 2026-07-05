import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { NavItem, getNav } from "./NavigationConfig";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();

  if (!user) return null;

  const items = getNav(user.role);

  const handleLink = () => {
    onClose();
  };

  return (
    <>
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-sm" onClick={onClose} />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-navy-800
          border-r border-navy-100 dark:border-navy-700
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-30 lg:w-64
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-2.5 px-6 h-16 border-b border-navy-100 dark:border-navy-700">
            <Link to="/" className="flex items-center gap-2.5" onClick={handleLink}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-navy-900 dark:text-white">Trust Market</span>
            </Link>
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-navy-400 hover:text-navy-600 hover:bg-navy-100 dark:hover:text-navy-200 dark:hover:bg-navy-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {items.map((item) => (
              <SidebarLink key={item.path} item={item} active={location.pathname === item.path} onClick={handleLink} />
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-navy-100 dark:border-navy-700 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-700 dark:text-primary-300">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-900 dark:text-white truncate">{user.fullName}</p>
                <p className="text-xs text-navy-400 truncate">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3">
              <button onClick={toggle} className="flex-1 text-xs text-navy-400 hover:text-navy-600 dark:hover:text-navy-200 px-2 py-1.5 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-700 transition-colors">
                {dark ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button onClick={logout} className="text-xs text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 shadow-sm"
          : "text-navy-500 hover:text-navy-700 hover:bg-navy-50 dark:text-navy-400 dark:hover:text-navy-200 dark:hover:bg-navy-700/50"
      }`}
    >
      <span className={active ? "text-primary-600 dark:text-primary-400" : "text-navy-400 dark:text-navy-500"}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
