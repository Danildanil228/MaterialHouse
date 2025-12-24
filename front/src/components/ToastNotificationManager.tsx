import { useState, useEffect } from 'react';
import ToastNotification from './ToastNotification';
import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';
import { useNotifications } from '@/contexts/NotificationContext';

interface ToastNotificationItem {
  id: number;
  title: string;
  message: string;
  user_name?: string;
  timestamp: number;
}

export default function ToastNotificationManager() {
  const [toasts, setToasts] = useState<ToastNotificationItem[]>([]);
  const { fetchUnreadCount } = useNotifications();

  useEffect(() => {
    // Подключаемся к сокету
    const socket = io(API_BASE_URL);
    
    socket.on('new_notification', (data: any) => {
      const newToast: ToastNotificationItem = {
        id: Date.now(),
        title: data.title,
        message: data.message,
        user_name: data.user_name,
        timestamp: Date.now()
      };
      
      setToasts(prev => {
        // Ограничиваем максимум 3 уведомления одновременно
        const newToasts = [newToast, ...prev];
        return newToasts.slice(0, 3);
      });
      
      // Обновляем счетчик
      fetchUnreadCount();
      
      // Показываем браузерное уведомление если разрешено
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/icon.png'
        });
      }
    });
    
    return () => {
      socket.disconnect();
    };
  }, [fetchUnreadCount]);

  const handleClose = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Очищаем старые уведомления (старше 15 секунд)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(toast => now - toast.timestamp < 15000));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          user_name={toast.user_name}
          onClose={() => handleClose(toast.id)}
        />
      ))}
    </div>
  );
}