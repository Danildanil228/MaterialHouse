const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Создаем пул подключений к БД
const pool = new Pool({
    user: "postgres",
    password: "1234",
    host: 'localhost',
    port: '5432',
    database: "materialHousedb"
});

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes(':5173')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Эндпоинт логина
app.post('/login', async (req, res) => {
  console.log('=== ЗАПРОС НА /LOGIN ===');
  console.log('Тело запроса:', req.body);
  console.log('Заголовки:', req.headers);
  
  try {
    const { username, password } = req.body;
    
    console.log('Получены данные:', { username, password });
    
    if (!username || !password) {
      console.log('Ошибка: нет логина или пароля');
      return res.status(400).json({ 
        success: false, 
        error: 'Логин и пароль обязательны' 
      });
    }
    
    console.log('Выполняем запрос к БД...');
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2', 
      [username, password]
    );
    
    console.log('Результат БД:', result.rows);
    console.log('Найдено записей:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('Пользователь не найден');
      return res.status(401).json({ 
        success: false, 
        error: 'Неверный логин или пароль' 
      });
    }
    
    const user = result.rows[0];
    console.log('Успешная авторизация для:', user.username);
    //Уведомления
    const adminResult = await pool.query("select id from users where role = 'admin' ")
    for (const admin of adminResult.rows) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message)
        VALUES ($1, 'login', 'Новый вход', $2)`, 
        [user.id, `Пользователь ${user.username} вошел в систему`]
      );
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role
        
      }
    });
    
  } catch (err) {
    console.error('ОШИБКА В /LOGIN:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

//уведомления
app.get('/notifications', async (req,res) => {
  try{
    const result = await pool.query (
      `select n.*, u.username as user_name from notifications n left join users u on n.user_id = u.id
      order by n.created_at desc limit 50`
    );
    res.json({
    success: true, notifications: result.rows
  })
  }
  
  catch (err){
    console.error('Ошибка', err);
    res.status(500).json({
      success: false, error: 'Ошибка сервера'
    });
  }
})


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});