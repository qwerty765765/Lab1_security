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

// Обработчик запросов для Vercel
module.exports = async (req, res) => {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обработка preflight запросов (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Получаем путь запроса
    const urlParts = req.url.split('/').filter(part => part !== '');
    const id = urlParts[urlParts.length - 1];
    
    // Читаем данные
    let data = readData();
    
    // Обработка разных методов
    switch (req.method) {
      case 'GET':
        if (id && !isNaN(id)) {
          // Получение одного объекта по ID
          const item = data.security.find(item => item.id === parseInt(id));
          if (item) {
            return res.status(200).json(item);
          } else {
            return res.status(404).json({ error: 'Object not found' });
          }
        } else {
          // Получение всех объектов
          return res.status(200).json(data.security);
        }
        
      case 'POST':
        // Создание нового объекта
        const newItem = {
          ...req.body,
          id: Date.now()
        };
        data.security.push(newItem);
        if (writeData(data)) {
          return res.status(201).json(newItem);
        } else {
          return res.status(500).json({ error: 'Failed to save data' });
        }
        
      case 'PUT':
        // Обновление объекта
        if (id && !isNaN(id)) {
          const index = data.security.findIndex(item => item.id === parseInt(id));
          if (index !== -1) {
            data.security[index] = {
              ...data.security[index],
              ...req.body,
              id: parseInt(id)
            };
            if (writeData(data)) {
              return res.status(200).json(data.security[index]);
            } else {
              return res.status(500).json({ error: 'Failed to save data' });
            }
          } else {
            return res.status(404).json({ error: 'Object not found' });
          }
        } else {
          return res.status(400).json({ error: 'Invalid ID' });
        }
        
      case 'DELETE':
        // Удаление объекта
        if (id && !isNaN(id)) {
          const index = data.security.findIndex(item => item.id === parseInt(id));
          if (index !== -1) {
            data.security.splice(index, 1);
            if (writeData(data)) {
              return res.status(200).json({ message: 'Object deleted successfully' });
            } else {
              return res.status(500).json({ error: 'Failed to save data' });
            }
          } else {
            return res.status(404).json({ error: 'Object not found' });
          }
        } else {
          return res.status(400).json({ error: 'Invalid ID' });
        }
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
