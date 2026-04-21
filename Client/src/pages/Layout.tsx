import { Outlet } from "react-router";
import { useAppSelector } from "@/redux/hooks";
import { Sidebar } from "../components/Organisms/Sidebar";
import { Footer } from "../components/Organisms/Footer";

export default function Layout() {
  const { user } = useAppSelector((state) => state.user);
  const isAuthenticated = !!user;

  return (
    <div className="flex min-h-screen">
      {isAuthenticated && <Sidebar />}
      <div className={`flex flex-col flex-1 min-h-screen ${isAuthenticated ? "ml-64" : ""}`}>
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
