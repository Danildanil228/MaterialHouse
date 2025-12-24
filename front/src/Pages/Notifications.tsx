import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: number;
  title: string;
  message: string;
  user_name: string;
  created_at: string;
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка админа
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
    
    fetchNotifications();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("http://localhost:3000/notifications");
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Уведомления</h1>
      
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-4 border rounded-lg ${
              notif.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex justify-between">
              <h3 className="font-semibold">{notif.title}</h3>
              <span className="text-sm text-gray-500">
                {new Date(notif.created_at).toLocaleString()}
              </span>
            </div>
            <p className="mt-2">{notif.message}</p>
            {notif.user_name && (
              <p className="text-sm text-gray-600 mt-1">
                Пользователь: {notif.user_name}
              </p>
            )}
          </div>
        ))}
        
        {notifications.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Нет уведомлений
          </p>
        )}
      </div>
    </div>
  );
}