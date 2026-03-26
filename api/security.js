
// Хранилище данных в памяти (in-memory)
let securityData = [
  {
    "id": 1,
    "name": "Жилой комплекс «Безопасный дом»",
    "type": "Комплексная система",
    "address": "ул. Ленина, 15",
    "cameras": 48,
    "staff": 12,
    "status": "active",
    "description": "Полный комплекс мер безопасности включает видеонаблюдение по периметру, контроль доступа в подъезды и на парковку, круглосуточное патрулирование территории.",
    "emergency_contacts": "+7 (495) 123-45-67"
  },
  {
    "id": 2,
    "name": "Бизнес-центр «Платина»",
    "type": "Контроль доступа",
    "address": "пр. Мира, 88",
    "cameras": 32,
    "staff": 8,
    "status": "active",
    "description": "Система контроля доступа с биометрической идентификацией, турникеты на входе, видеонаблюдение в холлах и лифтах.",
    "emergency_contacts": "+7 (495) 987-65-43"
  },
  {
    "id": 3,
    "name": "Квартал «Зеленый сад»",
    "type": "Видеонаблюдение",
    "address": "ул. Садовая, 24-28",
    "cameras": 64,
    "staff": 6,
    "status": "maintenance",
    "description": "Модернизация системы видеонаблюдения, замена устаревшего оборудования на IP-камеры высокого разрешения.",
    "emergency_contacts": "+7 (495) 555-12-34"
  },
  {
    "id": 4,
    "name": "Жилой комплекс «Академический»",
    "type": "Пожарная безопасность",
    "address": "ул. Академика Королева, 12",
    "cameras": 24,
    "staff": 4,
    "status": "active",
    "description": "Автоматическая система пожаротушения, датчики дыма и температуры, оповещение жильцов.",
    "emergency_contacts": "+7 (495) 777-88-99"
  },
  {
    "id": 5,
    "name": "Торговый центр «Гранд»",
    "type": "Охранная сигнализация",
    "address": "ш. Энтузиастов, 56",
    "cameras": 96,
    "staff": 20,
    "status": "active",
    "description": "Круглосуточная охрана, система тревожной сигнализации, быстрый выезд группы быстрого реагирования.",
    "emergency_contacts": "+7 (495) 333-44-55"
  }
];

// Функция для получения следующего ID
const getNextId = () => {
  if (securityData.length === 0) return 1;
  const maxId = Math.max(...securityData.map(item => item.id));
  return maxId + 1;
};

// Обработчик запросов
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
    // Получаем путь и ID
    const path = req.url.split('?')[0];
    const pathParts = path.split('/').filter(p => p !== '');
    const id = pathParts[pathParts.length - 1];
    
    console.log(`[API] Method: ${req.method}, ID: ${id}, Path: ${path}`);
    
    // GET запросы
    if (req.method === 'GET') {
      // Если есть ID и это число
      if (id && !isNaN(parseInt(id))) {
        const item = securityData.find(item => item.id === parseInt(id));
        if (item) {
          console.log(`[API] GET /${id} - Found: ${item.name}`);
          return res.status(200).json(item);
        } else {
          console.log(`[API] GET /${id} - Not found`);
          return res.status(404).json({ error: 'Object not found' });
        }
      } else {
        // Возвращаем все объекты
        console.log(`[API] GET / - Returning ${securityData.length} items`);
        return res.status(200).json(securityData);
      }
    }
    
    // POST запросы (создание)
    if (req.method === 'POST') {
      console.log('[API] POST - Creating new item:', req.body);
      
      const newItem = {
        id: getNextId(),
        name: req.body.name || '',
        type: req.body.type || '',
        address: req.body.address || '',
        cameras: req.body.cameras || 0,
        staff: req.body.staff || 0,
        status: req.body.status || 'active',
        description: req.body.description || '',
        emergency_contacts: req.body.emergency_contacts || ''
      };
      
      securityData.push(newItem);
      console.log(`[API] POST - Created item with id ${newItem.id}: ${newItem.name}`);
      return res.status(201).json(newItem);
    }
    
    // PUT запросы (обновление)
    if (req.method === 'PUT') {
      if (id && !isNaN(parseInt(id))) {
        const index = securityData.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          const updatedItem = {
            ...securityData[index],
            ...req.body,
            id: parseInt(id)
          };
          securityData[index] = updatedItem;
          console.log(`[API] PUT /${id} - Updated: ${updatedItem.name}`);
          return res.status(200).json(updatedItem);
        } else {
          console.log(`[API] PUT /${id} - Not found`);
          return res.status(404).json({ error: 'Object not found' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid ID' });
      }
    }
    
    // DELETE запросы (удаление)
    if (req.method === 'DELETE') {
      if (id && !isNaN(parseInt(id))) {
        const index = securityData.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          const deletedItem = securityData[index];
          securityData.splice(index, 1);
          console.log(`[API] DELETE /${id} - Deleted: ${deletedItem.name}`);
          return res.status(200).json({ 
            message: 'Object deleted successfully', 
            deleted: deletedItem 
          });
        } else {
          console.log(`[API] DELETE /${id} - Not found`);
          return res.status(404).json({ error: 'Object not found' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid ID' });
      }
    }
    
    // Если метод не поддерживается
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};
