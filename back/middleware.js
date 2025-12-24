const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: 'localhost',
    port: '5432',
    database: "materialHousedb"
});

// Middleware для проверки авторизации
const authMiddleware = async (req, res, next) => {
  try {
    // Получаем токен из заголовков или куков
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'Не авторизован' });
    }
    
    // В вашем случае пока используем простую проверку через ID из localStorage
    // Для реального проекта рекомендуется использовать JWT
    const userId = req.headers['user-id'] || req.body.currentUserId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Не авторизован' });
    }
    
    // Проверяем, существует ли пользователь в БД
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Пользователь не найден' });
    }
    
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return res.status(401).json({ success: false, error: 'Ошибка авторизации' });
  }
};

module.exports = { authMiddleware };