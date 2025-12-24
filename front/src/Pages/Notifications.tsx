import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/components/api";
import { io, Socket } from "socket.io-client";
import {
  AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
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
  const socketRef = useRef<Socket | null>(null);

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
    const interval = setInterval(fetchNotifications, 5000);
    
    socketRef.current = io(API_BASE_URL)
    socketRef.current.on('new_notification', (data:any) => {
      console.log('Новое уведомление', data)
      const newNotification: Notification = {
        id: Date.now(), title: data.title,
        message: data.message, user_name: data.user_name,
        created_at: new Date().toISOString(), read: false
      }

      setNotifications(prev => [newNotification, ...prev]);

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/icon.png'
        });
      }

      
    })
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        clearInterval(interval);
      }
    };
    
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`);
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
  const handleDeleteNot = async (id:number) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`)
      setNotifications(notifications.filter(n=>n.id !== id));
    } catch (error){
        console.error("Ошибка удаления", error);
        alert("Не удалось удалить уведомление")
    }
  }
  const handleDeleteAllNot = async () => {
  
    try {
      await axios.delete(`${API_BASE_URL}/notifications`);
      setNotifications([]);
      
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert("Не удалось удалить уведомления");
    }
};

  return (
    <div className=" mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl mb-4">Уведомления</h1>
        {notifications.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Удалить все ({notifications.length})</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Удалить все уведомления?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllNot}>Удалить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`p-4 border rounded-lg
            `}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xs">{notif.title}</h3>
              <div className="flex items-center gap-10">
                <span className="text-sm">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
                <button onClick={() => handleDeleteNot(notif.id)}><img src="/trash.png" className="icon-theme-aware w-5 items-center" alt="" /></button>
              </div>
              
            </div>
            <p className="mt-2 text-xl">{notif.message}</p>
            {notif.user_name && (
              <p className="text-sm mt-1">
                Пользователь: {notif.user_name}
              </p>
            )}
          </div>
        ))}
        
        {notifications.length === 0 && (
          <p className=" text-center py-8">
            Нет уведомлений
          </p>
        )}
      </div>
    </div>
  );
}