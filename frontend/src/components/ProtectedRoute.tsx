
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'ADMIN' | 'STAFF' | 'PARTICIPANT' | ('ADMIN' | 'STAFF' | 'PARTICIPANT')[];
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = !requiredRole || (
    Array.isArray(requiredRole) 
      ? requiredRole.includes(user?.role as any)
      : user?.role === requiredRole
  );

  if (!hasRequiredRole) {
    let redirect = '/login';
    if (user?.role === 'ADMIN') redirect = '/admin/events';
    if (user?.role === 'STAFF') redirect = '/staff/schedule';
    if (user?.role === 'PARTICIPANT') redirect = '/participant/events';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
}
