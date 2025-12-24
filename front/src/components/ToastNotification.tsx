import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from './api';

interface ToastNotificationProps {
  id: number;
  title: string;
  message: string;
  user_name?: string;
  onClose: () => void;
}

export default function ToastNotification({ 
  id, 
  title, 
  message, 
  user_name, 
  onClose 
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Показываем с задержкой для анимации
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = async () => {
    setIsClosing(true);
    
    try {
      // Отмечаем уведомление как прочитанное
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
      onClose();
    } catch (error) {
      console.error('Ошибка при закрытии уведомления:', error);
      onClose(); // Все равно закрываем даже при ошибке
    }
  };

  // Автоматическое закрытие через 10 секунд
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isClosing) {
        handleClose();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isClosing]);

  if (!isVisible && isClosing) return null;

  return (
    <div className={`
      fixed right-4 top-4 z-10 w-80 max-w-full border rounded-xl
      transform transition-all duration-300 ease-in-out bg-background
      ${isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className=" rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold ">
              {title}
            </h3>
            <button
              onClick={handleClose}
              className=""
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-sm mb-2">
            {message}
          </p>
          
          {user_name && (
            <p className="text-xs">
              От: {user_name}
            </p>
          )}
          
          <div className="mt-3 pt-3 border-t  flex justify-between items-center">
            <span className="text-xs">
              Только что
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}