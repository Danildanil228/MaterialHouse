import DarkModeButtonToggle from "@/components/DarkModeButtonToggle";
import "./Login.css";

export default function Login() {
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
                        />
                        <input 
                            type="password" 
                            placeholder="Введите ваш пароль" 
                            className="px-4 py-2 border rounded focus:outline-none focus:ring-1"
                        />
                        <div className="flex gap-5 items-center">
                            <button className="w-full px-6 py-2 border rounded cursor-pointer hover:transition-colors">
                                Вход
                            </button>
                            <DarkModeButtonToggle/>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
}