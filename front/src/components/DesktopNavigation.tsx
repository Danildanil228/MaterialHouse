import { Link, useLocation } from 'react-router-dom';

export default function DesktopNavigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/main', label: 'Главная' },
    { path: '/materials', label: 'Материалы' },
    { path: '/add', label: 'Добавить' },
    { path: '/profile', label: 'Профиль' },
  ];
  
  return (
    <div className="hidden lg:block bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-lg ${
                location.pathname === item.path 
                  ? 'text-blue-600 font-semibold border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}