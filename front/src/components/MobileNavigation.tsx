import { useNotifications } from '@/contexts/NotificationContext';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileNavigation() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>('');
  const { unreadCount } = useNotifications();
  
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserRole(user.role);
    }
  }, []);
  
  const navItems = [
    { 
      path: '/main', 
      label: 'Главная', 
      icon: '/home.svg',
      visibleToAll: true
    },
    { 
      path: '/materials', 
      label: 'Материалы', 
      icon: '/material.png',
      visibleToAll: true
      
    },
    { 
      path: '/add', 
      label: 'Добавить', 
      icon: '/add.png',
      visibleToAll: false,
      requireAdmin: true
    },
    { 
      path: '/profile', 
      label: 'Профиль', 
      icon: '/profile.png'
    },
    {
      path: '/notifications',
      label: 'Уведомления',
      icon: '/not.png',
      visibleToAll: false, 
      requireAdmin: true,
      showBadge: true
    }
  ];
   const filteredNavItems = navItems.filter(item => {
    if (item.visibleToAll) return true;
    if (item.requireAdmin && userRole === 'admin') return true;
    return false;
  });
  
  const isActive = (path: string) => {
    if (path === '/main') {
      return location.pathname === '/' || location.pathname === '/main';
    }
    return location.pathname === path;
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0  border-t z-50 bg-background">
      <div className="flex justify-around py-2">
        {filteredNavItems.map((item) => {
          const active = isActive(item.path);
          const showBadge = item.showBadge && unreadCount > 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center py-1 px-2 flex-1 min-w-0 relative"
            >
              <div className="relative mb-1">
                <img 
                  src={item.icon} 
                  alt={item.label}
                  className={`w-6 h-6 icon-theme-aware ${
                    active 
                      ? 'filter brightness-0 invert-[30%] sepia-[90%] saturate-[3000%] hue-rotate-[220deg]' 
                      : 'filter brightness-0 opacity-60'
                  }`}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-xs ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}