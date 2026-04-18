// api/security.js

// Хранилище данных в памяти
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
    "emergency_contacts": "+7 (495) 123-45-67",
    "buildingType": "residential"
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
    "emergency_contacts": "+7 (495) 555-12-34",
    "buildingType": "residential"
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
    "emergency_contacts": "+7 (495) 777-88-99",
    "buildingType": "residential"
  }
];

// Вычисляем следующий ID
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
    const url = req.url;
    const parts = url.split('/').filter(p => p !== '');
    let id = null;
    
    const lastPart = parts[parts.length - 1];
    if (lastPart && !isNaN(parseInt(lastPart))) {
      id = parseInt(lastPart);
    }
    
    console.log(`[API] ${req.method} ${url} - ID: ${id}`);
    
    // GET запросы
    if (req.method === 'GET') {
      if (id !== null) {
        const item = securityData.find(item => item.id === id);
        if (item) {
          return res.status(200).json(item);
        } else {
          return res.status(404).json({ error: `Object with id ${id} not found` });
        }
      } else {
        return res.status(200).json(securityData);
      }
    }
    
    // POST запросы (создание)
    if (req.method === 'POST') {
      const newId = getNextId();
      
      const newItem = {
        id: newId,
        name: req.body.name || '',
        type: req.body.type || '',
        address: req.body.address || '',
        cameras: req.body.cameras || 0,
        staff: req.body.staff || 0,
        status: req.body.status || 'active',
        description: req.body.description || '',
        emergency_contacts: req.body.emergency_contacts || '',
        buildingType: req.body.buildingType || ''  // 👈 ДОБАВЛЕНО
      };
      
      securityData.push(newItem);
      console.log(`[API] POST - Created: ${newItem.name} (тип здания: ${newItem.buildingType})`);
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
            id: id,
            buildingType: req.body.buildingType || securityData[index].buildingType  // 👈 ДОБАВЛЕНО
          };
          securityData[index] = updatedItem;
          console.log(`[API] PUT - Updated item ${id}: ${updatedItem.name}`);
          return res.status(200).json(updatedItem);
        } else {
          return res.status(404).json({ error: `Object with id ${id} not found` });
        }
      } else {
        return res.status(400).json({ error: 'ID is required for PUT request' });
      }
    }
    
    // DELETE запросы
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
