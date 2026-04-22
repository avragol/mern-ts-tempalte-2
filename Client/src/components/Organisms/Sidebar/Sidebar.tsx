import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/slices/userSlice";
import { getSidebarMenuItems, routeConfig } from "@/config/routesConfig";
import type { SidebarMenuItem, SidebarSubMenuItem } from "@/config/routesConfig";
import { MenuItem } from "@/components/Molecules/MenuItem";
import { LanguageToggle } from "@/components/Molecules/LanguageToggle";

// Maps English route names → translation keys
const NAV_KEY: Record<string, string> = {
  "Home": "nav.home",
  "Profile": "nav.profile",
  "View Profile": "nav.viewProfile",
  "Settings": "nav.settings",
  "Preferences": "nav.preferences",
  "Knowledge Base": "nav.knowledgeBase",
  "All Items": "nav.allItems",
  "New Item": "nav.newItem",
  "Dashboard": "nav.dashboard",
  "Overview": "nav.overview",
  "General": "nav.general",
  "Security": "nav.security",
  "Notifications": "nav.notifications",
};

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function Sidebar({ open = false, onClose, className }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  const isAuthenticated = !!user;

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const menuItems: SidebarMenuItem[] = getSidebarMenuItems(
    routeConfig,
    isAuthenticated,
    user?.role
  );

  const translateLabel = (label: string) =>
    NAV_KEY[label] ? t(NAV_KEY[label]) : label;

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isSubMenuActive = (subMenus?: SidebarSubMenuItem[]) => {
    if (!subMenus) return false;
    return subMenus.some((subMenu) => location.pathname === subMenu.path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const sidebarContent = (
    <aside
      className={`h-full w-64 flex flex-col bg-sidebar border-r border-sidebar-border ${className ?? ""}`}
    >
      <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-5">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold text-sidebar-foreground hover:text-primary transition-colors"
          onClick={onClose}
        >
          <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-black flex-shrink-0">
            G
          </span>
          Golda
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isExpanded = expandedMenus.has(item.label);
            const isItemActive = isActive(item.path) || isSubMenuActive(item.subMenus);
            return (
              <MenuItem
                key={item.label}
                label={translateLabel(item.label)}
                path={item.path}
                icon={item.icon}
                subMenus={item.subMenus?.map((sub) => ({
                  label: translateLabel(sub.label),
                  path: sub.path,
                }))}
                isExpanded={isExpanded}
                isActive={isItemActive}
                onToggle={() => toggleMenu(item.label)}
              />
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="flex justify-start">
          <LanguageToggle />
        </div>

        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-9 h-9 rounded-full border-2 border-primary/30 flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground bg-transparent"
            >
              {t("nav.logout")}
            </Button>
          </div>
        ) : (
          <Button onClick={() => navigate("/login")} className="w-full">
            {t("nav.login")}
          </Button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible fixed sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 z-40">
        {sidebarContent}
      </div>

      {/* Mobile: overlay drawer with Framer Motion */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 z-50"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
