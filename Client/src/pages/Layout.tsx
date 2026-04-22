import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { Sidebar } from "../components/Organisms/Sidebar";
import { Footer } from "../components/Organisms/Footer";

export default function Layout() {
  const { user } = useAppSelector((state) => state.user);
  const isAuthenticated = !!user;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {isAuthenticated && (
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className={`flex flex-col flex-1 min-h-screen ${isAuthenticated ? "md:ml-64" : ""}`}>
        {isAuthenticated && (
          <div className="md:hidden flex items-center h-14 px-4 border-b border-border bg-secondary">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-secondary-foreground hover:bg-sidebar-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="ml-3 text-lg font-bold text-secondary-foreground">Golda</span>
          </div>
        )}
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
