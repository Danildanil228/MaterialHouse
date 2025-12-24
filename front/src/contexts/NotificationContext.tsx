import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL } from '@/components/api';

interface NotificationContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  fetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchUnreadCount = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      if (user.role !== 'admin') return;

      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`);
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Ошибка получения количества уведомлений:', error);
    }
  };

  useEffect(() => {
    // Проверяем, является ли пользователь админом
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    if (user.role !== 'admin') return;

    // Получаем начальное количество
    fetchUnreadCount();

    // Подключаемся к сокету для обновлений в реальном времени
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on('new_notification', () => {
      // Увеличиваем счетчик при новом уведомлении
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}