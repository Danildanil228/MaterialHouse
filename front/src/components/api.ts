const getApiBaseUrl = () => {
  // Если на localhost, используем localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // Иначе берем тот же хост, что и у фронтенда, но порт 3000
  return `http://${window.location.hostname}:3000`;
};

export const API_BASE_URL = getApiBaseUrl();