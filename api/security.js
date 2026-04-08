// Хранилище данных в памяти
let securityData = [
  {
    "id": 1,
    "name": "Жилой комплекс «Безопасный дом»",
    "type": "Комплексная система",
    "address": "г. Новосибирск, ул. Ленина, 15",
    "cameras": 48,
    "staff": 12,
    "status": "active",
    "description": "Полный комплекс мер безопасности включает видеонаблюдение по периметру, контроль доступа в подъезды и на парковку, круглосуточное патрулирование территории.",
    "emergency_contacts": "+7 (495) 123-45-67"
  },
  {
    "id": 3,
    "name": "Квартал «Зеленый сад»",
    "type": "Видеонаблюдение",
    "address": "г. Новосибирск, ул. Советская,5",
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
    "address": "г. Москва, ул. Академика Королева, 12",
    "cameras": 24,
    "staff": 4,
    "status": "active",
    "description": "Автоматическая система пожаротушения, датчики дыма и температуры, оповещение жильцов.",
    "emergency_contacts": "+7 (495) 777-88-99"
  }
];

// Вычисляем следующий ID на основе существующих данных
const getNextId = () => {
  const maxId = Math.max(...securityData.map(item => item.id), 0);
  return maxId + 1;
};

module.exports = async (req, res) => {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Получаем ID из URL (поддержка /api/security и /api/security/1)
    const url = req.url;
    const parts = url.split('/').filter(p => p !== '');
    let id = null;
    
    // Если последняя часть это число, то это ID
    const lastPart = parts[parts.length - 1];
    if (lastPart && !isNaN(parseInt(lastPart))) {
      id = parseInt(lastPart);
    }
    
    console.log(`[API] ${req.method} ${url} - ID: ${id}`);
    
    // GET запросы
    if (req.method === 'GET') {
      if (id !== null) {
        // Получение одного объекта по ID
        const item = securityData.find(item => item.id === id);
        if (item) {
          console.log(`[API] GET - Found item ${id}: ${item.name}`);
          return res.status(200).json(item);
        } else {
          console.log(`[API] GET - Item ${id} not found`);
          return res.status(404).json({ error: `Object with id ${id} not found` });
        }
      } else {
        // Получение всех объектов
        console.log(`[API] GET - Returning ${securityData.length} items`);
        return res.status(200).json(securityData);
      }
    }
    
    // POST запросы (создание)
    if (req.method === 'POST') {
      const newId = getNextId();
      console.log(`[API] POST - Creating new item with id ${newId}`, req.body);
      
      const newItem = {
        id: newId,
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
      console.log(`[API] POST - Created: ${newItem.name}`);
      return res.status(201).json(newItem);
    }
    
    // PUT запросы (обновление)
    if (req.method === 'PUT') {
      if (id !== null) {
        const index = securityData.findIndex(item => item.id === id);
        if (index !== -1) {
          const updatedItem = {
            ...securityData[index],
            ...req.body,
            id: id
          };
          securityData[index] = updatedItem;
          console.log(`[API] PUT - Updated item ${id}: ${updatedItem.name}`);
          return res.status(200).json(updatedItem);
        } else {
          console.log(`[API] PUT - Item ${id} not found`);
          return res.status(404).json({ error: `Object with id ${id} not found` });
        }
      } else {
        return res.status(400).json({ error: 'ID is required for PUT request' });
      }
    }
    
    // DELETE запросы (удаление)
    if (req.method === 'DELETE') {
      if (id !== null) {
        const index = securityData.findIndex(item => item.id === id);
        if (index !== -1) {
          const deletedItem = securityData[index];
          securityData.splice(index, 1);
          console.log(`[API] DELETE - Deleted item ${id}: ${deletedItem.name}`);
          return res.status(200).json({ 
            message: 'Object deleted successfully',
            deleted: deletedItem
          });
        } else {
          console.log(`[API] DELETE - Item ${id} not found`);
          return res.status(404).json({ error: `Object with id ${id} not found` });
        }
      } else {
        return res.status(400).json({ error: 'ID is required for DELETE request' });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
