import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  username: string;
  role: string;
}

export default function Header(){
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate("/login");
        }
    }, [navigate]);
    
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };
    
    if (!user) {
        return null;
    }
    
    return(
        <section className="container flex justify-between items-center border-b">
            <div className="flex items-center gap-5">
                <div className="grid">
                    <p className="">Пользователь - {user.username}</p>
                    <p>Роль - {user.role}</p>
                </div>
                
                <button onClick={handleLogout}>
                    <img src="/log.png" className="icon-theme-aware w-5" alt="" />
                </button>
            </div>
            <DarkModeButtonToggle/>
        </section>
    );
}