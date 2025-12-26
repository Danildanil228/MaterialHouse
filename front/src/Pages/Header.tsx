import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  username: string;
  role: string;
  name: string;
  secondname: string;
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
        <section className=" container flex flex-wrap justify-between items-center border-b py-4! sm:border-none">
            <p>
                {user.role === 'admin' ? 'Администратор' : 
                user.role === 'storekeeper' ? 'Работник склада' : 
                user.role === 'accountant' ? 'Бухгалтер' : 
                'Неизвестная роль'}
            </p>
            <p>{user.name} {user.secondname}</p>

            <div className="items-center flex gap-5">
                <DarkModeButtonToggle/>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline"><img src="/log.png" className="icon-theme-aware w-5" alt="" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>Выйти</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </section>
    );
}