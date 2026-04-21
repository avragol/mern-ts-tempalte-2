import { useAppSelector } from "@/redux/hooks";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, requiredRole, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAppSelector((state) => state.user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    return fallback ?? <div className="p-8 text-center text-gray-600">Access denied.</div>;
  }

  return <>{children}</>;
}
