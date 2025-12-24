import { useNotifications } from '@/contexts/NotificationContext';
import { useEffect, useState } from 'react';
import { Link, useLocation,  } from 'react-router-dom';

export default function DesktopNavigation() {
  const { unreadCount } = useNotifications();
  const [userRole, setUserRole] = useState<string>('');
  
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      setUserRole(user.role);
    }
  }, []);

  const location = useLocation();
  const navItems = [
    { path: '/main', label: 'Главная', visibleToAll: true },
    { path: '/materials', label: 'Материалы', visibleToAll: true },
    { path: '/allusers', label: 'Все пользователи', visibleToAll: false, requireAdmin: true },
    { path: '/add', label: 'Добавить пользователя',visibleToAll: false, requireAdmin: true  },
    { path: '/profile', label: 'Профиль', visibleToAll: true },
    { 
      path: '/notifications', 
      label: 'Уведомления', 
      visibleToAll: false, 
      requireAdmin: true,
      showBadge: true
    },
    
  ];
  const filteredNavItems = navItems.filter(item => {
    if (item.visibleToAll) return true;
    if (item.requireAdmin && userRole === 'admin') return true;
    return false;
  });
  
  return (
    <div className=" container hidden lg:block border rounded-2xl my-4!">
      <div className="">
        <div className="flex justify-between py-4">
          {filteredNavItems.map((item) => {
            const showBadge = item.showBadge && unreadCount > 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-lg relative ${
                  location.pathname === item.path 
                    ? 'opacity-50' 
                    : 'hover:opacity-50'
                }`}
              >
                {item.label}
                {showBadge && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}