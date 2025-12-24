// front/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import Login from './Pages/Login';
import Main from './Pages/Main';
import Layout from './components/Layout';
import Notifications from './Pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import AddUser from './Pages/AddUser';
import AllUsers from './Pages/AllUsers';
import { NotificationProvider } from './contexts/NotificationContext';
import ToastNotificationManager from './components/ToastNotificationManager';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <NotificationProvider>
          <ToastNotificationManager />
        <Routes>
          {/* Публичный маршрут - без навигации */}
          <Route path="/login" element={<Login />} />
          
          {/* Защищенные маршруты - с навигацией */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/main" replace />} />
            <Route path="/main" element={<Main />} />
            <Route path="/notifications" element={
              <ProtectedRoute requireAdmin={true}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/materials" element={<div>Материалы (страница в разработке)</div>} />
            <Route path="/profile" element={<div>Профиль (страница в разработке)</div>} />
            <Route path="/add" element={
              <ProtectedRoute requireAdmin={true}>
                <AddUser />
              </ProtectedRoute>
            } />
            
            <Route path='/allusers' element={
              <ProtectedRoute requireAdmin={true}>
                <AllUsers />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Резервный редирект */}
          <Route path="*" element={<Navigate to="/main" replace />} />
        </Routes>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;