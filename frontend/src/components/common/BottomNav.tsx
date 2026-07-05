import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NavItem, getNav } from "./NavigationConfig";

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const items = getNav(user.role).filter((i) => i.bottomNav);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-navy-800 border-t border-navy-100 dark:border-navy-700 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <BottomNavLink key={item.path} item={item} active={location.pathname === item.path} />
        ))}
      </div>
    </nav>
  );
}

function BottomNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.path}
      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[64px] transition-all ${
        active
          ? "text-primary-600 dark:text-primary-400"
          : "text-navy-400 dark:text-navy-500"
      }`}
    >
      <span className={active ? "scale-110 transition-transform" : ""}>
        {item.icon}
      </span>
      <span className={`text-[10px] font-medium leading-tight ${active ? "font-semibold" : ""}`}>
        {item.label}
      </span>
      {active && <span className="absolute bottom-0.5 w-5 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />}
    </Link>
  );
}
