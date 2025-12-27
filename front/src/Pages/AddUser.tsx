import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { API_BASE_URL } from "@/components/api";
import { Link, useNavigate } from "react-router-dom";

interface CreatedUser {
  username: string;
  password: string;
  name: string;
  secondname: string;
  role: string;
}

export default function AddUser() {
  const [name, setName] = useState("");
  const [secondname, setSecondname] = useState("");
  const [role, setRole] = useState("");
  const [createdUsers, setCreatedUsers] = useState<CreatedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate("/main");
      return;
    }
  }, [navigate]);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const username = `${name}${secondname}`.toLowerCase();
      const password = generatePassword();

      const response = await axios.post(`${API_BASE_URL}/users/add`, {
        username,
        password,
        name,
        secondname,
        role
      });

      if (response.data.success) {
        const newUser: CreatedUser = {
          username,
          password,
          name,
          secondname,
          role
        };

        setCreatedUsers(prev => [newUser, ...prev]);
        setName("");
        setSecondname("");
        setRole("");
      }
    } catch (error) {
      console.error("Ошибка создания пользователя:", error);
      alert("Ошибка создания пользователя");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto">
        <div className="flex justify-between ">
            <h1 className="text-2xl font-bold mb-6">Добавить пользователя</h1>
            <Link to='/allusers' className="text-sm flex gap-3 items-center">Все пользователи <img src="/arrow.png" className="icon-theme-aware w-4 lg:block hidden" alt="" /></Link>
        </div>
      
      
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <p className="text-xl">Введите имя</p>
            <input 
              type="text" 
              placeholder="Имя" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-3 border rounded focus:outline-none focus:ring-1 text-xl"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <p className="text-xl">Введите фамилию</p>
            <input 
              type="text" 
              placeholder="Фамилия" 
              value={secondname}
              onChange={(e) => setSecondname(e.target.value)}
              className="px-4 py-3 border rounded focus:outline-none focus:ring-1 text-xl"
              required
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <p className="text-xl">Выберите роль</p>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="text-xl py-6">
              <SelectValue placeholder="Роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Администратор</SelectItem>
              <SelectItem value="accountant">Бухгалтер</SelectItem>
              <SelectItem value="storekeeper">Кладовщик</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="submit" 
          className="w-full lg:w-fit px-8 py-3 text-xl"
          disabled={loading || !name || !secondname || !role}
        >
          {loading ? "Создание..." : "Создать пользователя"}
        </Button>
      </form>

      {createdUsers.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Созданные пользователи:</h2>
          <div className="grid gap-3">
            {createdUsers.map((user, index) => (
              <div 
                key={index} 
                className="p-4 border rounded "
              >
                <p className="font-medium">
                  <span className="">Логин:</span> {user.username}
                </p>
                <p className="font-medium">
                  <span className="">Пароль:</span> {user.password}
                </p>
                <p className="">
                  {user.name} {user.secondname} • {user.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}