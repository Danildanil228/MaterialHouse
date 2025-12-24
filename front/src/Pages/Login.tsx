import { useState } from "react";
import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/components/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password
      });

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/main"); // Переход на главную страницу
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || "Ошибка сервера");
      } else {
        setError("Не удалось подключиться к серверу");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
        <section className="flex justify-center items-center min-h-screen container">
            <div className="text-center">
                <div>
                    <h1 className="mb-4">Авторизация в систему</h1>
                    
                    <div className="grid gap-5">
                        <input 
                            type="text" 
                            placeholder="Введите ваш логин" 
                            className="px-4 py-2 border rounded focus:outline-none focus:ring-1 "
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="Введите ваш пароль" 
                            className="px-4 py-2 border rounded focus:outline-none focus:ring-1"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="flex gap-5 items-center">
                            <button 
                              onClick={handleSubmit}
                              disabled={loading}
                              className="w-full px-6 py-2 border rounded cursor-pointer hover:transition-colors disabled:opacity-50"
                            >
                                {loading ? "Вход..." : "Вход"}
                            </button>
                            <DarkModeButtonToggle/>
                        </div>
                        {error && (
                      <div className="mb-4 p-2 text-xl! text-white rounded">
                        {error}
                      </div>
                    )}
                    </div>
                </div>
            </div>
        </section>
  );
}