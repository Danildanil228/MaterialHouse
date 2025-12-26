const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const http = require('http');
const socketIo = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Отключение:', socket.id);
  });
});

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
    io.emit('new_notification', {
      title: 'Новый вход',
      message: `Пользователь ${user.username} вошел в систему`,
      user_name: user.username
    });
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        secondname: user.secondname
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
// Удалить уведомление
app.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    
    res.json({ 
      success: true, 
      message: 'Уведомление удалено' 
    });
    
  } catch (err) {
    console.error('Ошибка удаления:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});
app.delete('/notifications', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications');
    
    res.json({ 
      success: true, 
      message: 'Все уведомления удалены' 
    });
    
  } catch (err) {
    console.error('Ошибка удаления всех:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});
// Получить количество непрочитанных уведомлений
app.get('/notifications/unread-count', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE read = false`
    );
    
    res.json({
      success: true,
      count: parseInt(result.rows[0].count)
    });
  } catch (err) {
    console.error('Ошибка получения количества:', err);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

// Отметить уведомления как прочитанные
app.put('/notifications/mark-as-read', async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET read = true WHERE read = false'
    );
    
    res.json({
      success: true,
      message: 'Все уведомления отмечены как прочитанные'
    });
  } catch (err) {
    console.error('Ошибка обновления:', err);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

app.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE notifications SET read = true WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Уведомление отмечено как прочитанное'
    });
  } catch (err) {
    console.error('Ошибка обновления уведомления:', err);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера'
    });
  }
});

//USERS
app.post('/users/add', async (req, res) => {
  try {
    const { username, password, name, surname, role } = req.body;
    
    // Проверяем, нет ли уже такого username
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким логином уже существует'
      });
    }
    
    // Добавляем пользователя
    const result = await pool.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3) RETURNING id, username, role`,
      [username, password, role]
    );
    
    res.json({
      success: true,
      user: result.rows[0]
    });
    
  } catch (err) {
    console.error('Ошибка создания пользователя:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});


// Удалить пользователя
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.headers['user-id'];
    
    if (currentUserId && parseInt(id) === parseInt(currentUserId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Вы не можете удалить свой собственный аккаунт' 
      });
    }
    
    // Получаем информацию о пользователе, которого удаляем
    const userToDelete = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    // Отправляем событие для выхода пользователя из системы
    io.emit('user_deleted', { userId: parseInt(id) });
    
    res.json({ 
      success: true, 
      message: 'Пользователь удален' 
    });
    
  } catch (err) {
    console.error('Ошибка удаления пользователя:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Получить всех пользователей
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * from users'
    );
    
    res.json({
      success: true,
      users: result.rows
    });
    
  } catch (err) {
    console.error('Ошибка получения пользователей:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});