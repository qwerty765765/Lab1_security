const fs = require('fs');
const path = require('path');

// Путь к файлу db.json в корне проекта
const dbPath = path.join(__dirname, '../db.json');

// Функция для чтения данных
const readData = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
    return { security: [] };
  } catch (error) {
    console.error('Error reading data:', error);
    return { security: [] };
  }
};

// Функция для записи данных
const writeData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

module.exports = async (req, res) => {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { method, url } = req;
  const id = url.split('/').pop(); // Получаем ID из URL
  
  const data = readData();
  let statusCode = 200;
  let responseData = {};
  
  try {
    switch (method) {
      case 'GET':
        if (id && id !== 'security') {
          // Получение одного объекта
          const item = data.security.find(item => item.id == id);
          if (item) {
            responseData = item;
          } else {
            statusCode = 404;
            responseData = { error: 'Object not found' };
          }
        } else {
          // Получение всех объектов
          responseData = data.security;
        }
        break;
        
      case 'POST':
        // Создание нового объекта
        const newItem = {
          ...req.body,
          id: Date.now()
        };
        data.security.push(newItem);
        if (writeData(data)) {
          responseData = newItem;
        } else {
          statusCode = 500;
          responseData = { error: 'Failed to save data' };
        }
        break;
        
      case 'PUT':
        // Обновление объекта
        if (id && id !== 'security') {
          const index = data.security.findIndex(item => item.id == id);
          if (index !== -1) {
            data.security[index] = {
              ...data.security[index],
              ...req.body,
              id: parseInt(id)
            };
            if (writeData(data)) {
              responseData = data.security[index];
            } else {
              statusCode = 500;
              responseData = { error: 'Failed to save data' };
            }
          } else {
            statusCode = 404;
            responseData = { error: 'Object not found' };
          }
        } else {
          statusCode = 400;
          responseData = { error: 'Invalid request' };
        }
        break;
        
      case 'DELETE':
        // Удаление объекта
        if (id && id !== 'security') {
          const index = data.security.findIndex(item => item.id == id);
          if (index !== -1) {
            const deleted = data.security.splice(index, 1);
            if (writeData(data)) {
              responseData = { message: 'Object deleted successfully', deleted: deleted[0] };
            } else {
              statusCode = 500;
              responseData = { error: 'Failed to save data' };
            }
          } else {
            statusCode = 404;
            responseData = { error: 'Object not found' };
          }
        } else {
          statusCode = 400;
          responseData = { error: 'Invalid request' };
        }
        break;
        
      default:
        statusCode = 405;
        responseData = { error: 'Method not allowed' };
    }
    
    res.status(statusCode).json(responseData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
