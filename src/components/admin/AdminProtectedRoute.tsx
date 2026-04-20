import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminProtectedRoute() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, []);

  if (isAdmin === null) return null; // Still checking

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}
