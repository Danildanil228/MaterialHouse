import { Outlet } from "react-router-dom";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import Header from "@/Pages/Header";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DesktopNavigation />
      
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="container mx-auto p-4">
          <Outlet /> {/* Сюда вставляются страницы */}
        </div>
      </main>
      
      <MobileNavigation />
    </div>
  );
}