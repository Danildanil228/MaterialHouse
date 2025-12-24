import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const userJson = localStorage.getItem('user');
  
  if (!userJson) {
    return <Navigate to="/login" replace />;
  }
  
  const user = JSON.parse(userJson);
  
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/main" replace />;
  }
  
  return <>{children}</>;
}