import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Если нет данных пользователя, перенаправляем на логин
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return null; // или можно показать загрузку
  }

  return (
    <section className="flex justify-center items-center min-h-screen container">
      <div className="text-center">
        <div>
          <h1 className="mb-4">Главная страница</h1>
          <div className="grid gap-5">
            <p>Добро пожаловать, <strong>{user.username}</strong>!</p>
            <button 
              onClick={handleLogout}
              className="px-6 py-2 border rounded cursor-pointer hover:transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}