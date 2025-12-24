import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import MobileNavigation from "@/components/MobileNavigation";
import DesktopNavigation from "@/components/DesktopNavigation";

export default function Main() {
  

  return (
    <>
    <DesktopNavigation />
    <Header/>
      <section className="flex justify-center items-center container">
        
      </section>
       
        <MobileNavigation />
    </>
  );
}