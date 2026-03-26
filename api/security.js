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

// Вычисляем следующий ID на основе существующих данных
const getNextId = () => {
  const maxId = Math.max(...securityData.map(item => item.id), 0);
  return maxId + 1;
};

// 🔧 Надёжная функция извлечения ID из URL
const extractIdFromUrl = (req) => {
  try {
    // Создаём полный URL для корректного парсинга
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost';
    const fullUrl = `${protocol}://${host}${req.url}`;
    
    const { pathname, searchParams } = new URL(fullUrl);
    
    // Разбиваем путь: /api/security/1 → ['api', 'security', '1']
    const parts = pathname.split('/').filter(p => p && p !== '');
    
    // Ищем числовой ID в последних частях пути
    // Поддерживаем: /api/security/1 и /api/security/1/
    for (let i = parts.length - 1; i >= 0; i--) {
      const potentialId = parseInt(parts[i], 10);
      if (!isNaN(potentialId) && parts[i] === potentialId.toString()) {
        return potentialId;
      }
    }
    
    return null;
  } catch (error) {
    console.error('[URL Parse Error]:', error.message);
    return null;
  }
};

module.exports = async (req, res) => {
  // 🔐 Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Обработка preflight-запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // 🔧 Извлекаем ID с помощью надёжной функции
    const id = extractIdFromUrl(req);
    
    // 🔍 Логирование для отладки
    console.log(`[API] ${req.method} ${req.url} - Parsed ID: ${id}`);
    
    // Парсинг JSON-тела запроса (если есть)
    let body = {};
    if (['POST', 'PUT'].includes(req.method) && req.headers['content-type']?.includes('application/json')) {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else {
        body = req.body || {};
      }
    }
    
    // ==================== GET ====================
    if (req.method === 'GET') {
      if (id !== null) {
        // Получение одного объекта по ID
        const item = securityData.find(item => item.id === id);
        if (item) {
          console.log(`[API] GET /${id} - Found: ${item.name}`);
          return res.status(200).json(item);
        } else {
          console.log(`[API] GET /${id} - Not found`);
          return res.status(404).json({ error: `Object with id ${id} not found` });
        }
      } else {
        // Получение всех объектов
        console.log(`[API] GET - Returning ${securityData.length} items`);
        return res.status(200).json(securityData);
      }
    }
    
    // ==================== POST ====================
    if (req.method === 'POST') {
      const newId = getNextId();
      console.log(`[API] POST - Creating new item with id ${newId}`);
      
      const newItem = {
        id: newId,
        name: body.name || '',
        type: body.type || '',
        address: body.address || '',
        cameras: typeof body.cameras === 'number' ? body.cameras : 0,
        staff: typeof body.staff === 'number' ? body.staff : 0,
        status: body.status || 'active',
        description: body.description || '',
        emergency_contacts: body.emergency_contacts || ''
      };
      
      securityData.push(newItem);
      console.log(`[API] POST - Created: ${newItem.name}`);
      return res.status(201).json(newItem);
    }
    
    // ==================== PUT ====================
    if (req.method === 'PUT') {
      if (id === null) {
        return res.status(400).json({ error: 'ID is required for PUT request' });
      }
      
      const index = securityData.findIndex(item => item.id === id);
      if (index !== -1) {
        const updatedItem = {
          ...securityData[index],
          ...body,
          id: id // гарантируем, что ID не изменится
        };
        securityData[index] = updatedItem;
        console.log(`[API] PUT /${id} - Updated: ${updatedItem.name}`);
        return res.status(200).json(updatedItem);
      } else {
        console.log(`[API] PUT /${id} - Not found`);
        return res.status(404).json({ error: `Object with id ${id} not found` });
      }
    }
    
    // ==================== DELETE ====================
    if (req.method === 'DELETE') {
      if (id === null) {
        return res.status(400).json({ error: 'ID is required for DELETE request' });
      }
      
      const index = securityData.findIndex(item => item.id === id);
      if (index !== -1) {
        const deletedItem = securityData.splice(index, 1)[0];
        console.log(`[API] DELETE /${id} - Deleted: ${deletedItem.name}`);
        return res.status(200).json({ 
          message: 'Object deleted successfully',
          deleted: deletedItem
        });
      } else {
        console.log(`[API] DELETE /${id} - Not found`);
        return res.status(404).json({ error: `Object with id ${id} not found` });
      }
    }
    
    // Метод не поддерживается
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('[API] Critical Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};
