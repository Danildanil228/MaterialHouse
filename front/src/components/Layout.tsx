import { Outlet } from "react-router-dom";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import Header from "@/Pages/Header";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <DesktopNavigation />
      
      <main className="pb-16 lg:pb-0">
        <Outlet /> {/* Сюда вставляются страницы */}
      </main>
      
      <MobileNavigation />
    </div>
  );
}