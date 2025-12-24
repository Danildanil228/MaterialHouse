import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import Login from './Pages/Login'
import Main from './Pages/Main'
import MobileNavigation from './components/MobileNavigation'
import DesktopNavigation from './components/DesktopNavigation'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
       
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/main" element={<Main />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        
        
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App