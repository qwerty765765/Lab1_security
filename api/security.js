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
  const maxId = Math.max(...securityData.map(item => item.id), 0);
  return maxId + 1;
};

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
    // Получаем ID из URL
    const urlParts = req.url.split('/').filter(part => part !== '');
    const id = urlParts[urlParts.length - 1];
    
    console.log(`Method: ${req.method}, ID: ${id}, URL: ${req.url}`);
    
    switch (req.method) {
      case 'GET':
        if (id && !isNaN(id)) {
          // Получение одного объекта по ID
          const item = securityData.find(item => item.id === parseInt(id));
          if (item) {
            return res.status(200).json(item);
          } else {
            return res.status(404).json({ error: 'Object not found' });
          }
        } else {
          // Получение всех объектов
          return res.status(200).json(securityData);
        }
        
      case 'POST':
        // Создание нового объекта
        console.log('Creating new item:', req.body);
        const newItem = {
          ...req.body,
          id: getNextId()
        };
        securityData.push(newItem);
        console.log('Item created:', newItem);
        return res.status(201).json(newItem);
        
      case 'PUT':
        // Обновление объекта
        if (id && !isNaN(id)) {
          const index = securityData.findIndex(item => item.id === parseInt(id));
          if (index !== -1) {
            securityData[index] = {
              ...securityData[index],
              ...req.body,
              id: parseInt(id)
            };
            console.log('Item updated:', securityData[index]);
            return res.status(200).json(securityData[index]);
          } else {
            return res.status(404).json({ error: 'Object not found' });
          }
        } else {
          return res.status(400).json({ error: 'Invalid ID' });
        }
        
      case 'DELETE':
        // Удаление объекта
        if (id && !isNaN(id)) {
          const index = securityData.findIndex(item => item.id === parseInt(id));
          if (index !== -1) {
            const deleted = securityData.splice(index, 1);
            console.log('Item deleted:', deleted[0]);
            return res.status(200).json({ message: 'Object deleted successfully', deleted: deleted[0] });
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
