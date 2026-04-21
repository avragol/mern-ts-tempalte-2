import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchCurrentUser } from '../redux/slices/userSlice';
import api from '@/services/api';
import { LoadingSpinner } from '@/components/Atoms';

export default function AppInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.user);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}
