import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import Login from './Pages/Login';
import Main from './Pages/Main';
import Layout from './components/Layout';
import Notifications from './Pages/Notifications';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        
        <Routes>
          {/* Публичный маршрут - без навигации */}
          <Route path="/login" element={<Login />} />
          
          {/* Защищенные маршруты - с навигацией */}
          <Route element={<Layout />}>
            <Route path="/main" element={<Main />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;