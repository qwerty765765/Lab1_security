// src/services/buildingService.js

// Ваш API-ключ Яндекс
const YANDEX_API_KEY = '5f4a6554-9ed8-4a68-b2b3-2d2f6118d973';

// Расширенная таблица цен
export const PRICE_CONFIG = {
  'business_center': {
    name: '🏢 Бизнес-центр',
    base: 15000,
    perCamera: 200,
    perStaff: 1000,
    description: 'Офисные помещения класса А, В, С'
  },
  'shopping_center': {
    name: '🛍️ Торговый центр',
    base: 20000,
    perCamera: 180,
    perStaff: 900,
    description: 'ТРЦ, ТЦ, моллы, торговые галереи'
  },
  'residential': {
    name: '🏠 Жилой дом',
    base: 5000,
    perCamera: 80,
    perStaff: 400,
    description: 'Жилые комплексы, многоквартирные дома'
  },
  'industrial': {
    name: '🏭 Промышленное',
    base: 12000,
    perCamera: 150,
    perStaff: 700,
    description: 'Заводы, фабрики, производственные цеха'
  },
  'education': {
    name: '🏫 Образование',
    base: 8000,
    perCamera: 100,
    perStaff: 500,
    description: 'Школы, ВУЗы, колледжи, детские сады'
  },
  'medical': {
    name: '🏥 Медицина',
    base: 10000,
    perCamera: 120,
    perStaff: 600,
    description: 'Больницы, поликлиники, медицинские центры'
  },
  'culture': {
    name: '🎭 Культура',
    base: 7000,
    perCamera: 90,
    perStaff: 450,
    description: 'Театры, музеи, библиотеки, кинотеатры'
  },
  'sport': {
    name: '🏟️ Спорт',
    base: 9000,
    perCamera: 110,
    perStaff: 550,
    description: 'Стадионы, спорткомплексы, фитнес-клубы'
  },
  'government': {
    name: '🏛️ Офисы/Администрация',
    base: 12000,
    perCamera: 140,
    perStaff: 700,
    description: 'Госучреждения, офисные здания'
  },
  'transport': {
    name: '🚗 Транспорт',
    base: 11000,
    perCamera: 130,
    perStaff: 650,
    description: 'Вокзалы, порты, аэропорты, автовокзалы'
  },
  'service': {
    name: '🔧 Сервис',
    base: 6000,
    perCamera: 85,
    perStaff: 425,
    description: 'Автосервисы, ателье, ремонтные мастерские'
  },
  'warehouse': {
    name: '📦 Склад',
    base: 8500,
    perCamera: 100,
    perStaff: 500,
    description: 'Складские помещения, логистические центры'
  },
  'other': {
    name: '📋 Другое',
    base: 7000,
    perCamera: 100,
    perStaff: 500,
    description: 'Прочие объекты'
  }
};

// Ключевые слова для определения типа здания
const TYPE_KEYWORDS = {
  'business_center': ['бизнес', 'бц', 'офис', 'деловой', 'business', 'office', 'коворкинг'],
  'shopping_center': ['торговый', 'тц', 'трц', 'молл', 'гипермаркет', 'магазин', 'shopping', 'mall', 'маркет'],
  'residential': ['жилой', 'жк', 'дом', 'квартал', 'жилкомплекс', 'residential', 'house', 'апартаменты'],
  'industrial': ['завод', 'фабрика', 'производство', 'промзона', 'цех', 'industrial', 'factory'],
  'education': ['школа', 'университет', 'институт', 'колледж', 'детский сад', 'гимназия', 'лицей', 'school', 'university'],
  'medical': ['больница', 'поликлиника', 'медицина', 'клиника', 'госпиталь', 'hospital', 'clinic', 'медцентр'],
  'culture': ['театр', 'музей', 'кинотеатр', 'библиотека', 'филармония', 'theater', 'museum', 'галерея'],
  'sport': ['стадион', 'спорткомплекс', 'фитнес', 'бассейн', 'спортзал', 'stadium', 'fitness', 'арена'],
  'government': ['администрация', 'мэрия', 'правительство', 'офис', 'government', 'office', 'дума'],
  'transport': ['вокзал', 'аэропорт', 'порт', 'автовокзал', 'station', 'airport', 'метро'],
  'service': ['автосервис', 'ателье', 'мастерская', 'ремонт', 'service', 'workshop', 'сервис'],
  'warehouse': ['склад', 'логистика', 'распределительный', 'warehouse', 'storage']
};

// Определение типа по названию
const detectTypeByName = (name) => {
  if (!name) return null;
  
  const lowerName = name.toLowerCase();
  
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return type;
      }
    }
  }
  return null;
};

// Определение типа по kind из геокодера
const detectTypeByKind = (kind, addressName) => {
  if (kind === 'house') {
    // Дополнительная проверка по названию
    const lowerName = (addressName || '').toLowerCase();
    if (lowerName.includes('бизнес') || lowerName.includes('офис')) {
      return 'business_center';
    }
    if (lowerName.includes('торговый') || lowerName.includes('тц')) {
      return 'shopping_center';
    }
    return 'residential';
  }
  return null;
};

// Основная функция определения типа здания (комбинированная)
export const detectBuildingType = async (address) => {
  try {
    console.log('🔍 Определение типа здания для адреса:', address);
    
    // Шаг 1: Геокодирование (получаем координаты и kind)
    const geocodeResponse = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`
    );
    const geocodeData = await geocodeResponse.json();
    
    const geoObject = geocodeData.response.GeoObjectCollection.featureMember[0]?.GeoObject;
    if (!geoObject) {
      console.log('❌ Адрес не найден');
      return { type: 'other', confidence: 'low', source: 'none' };
    }
    
    const point = geoObject.Point.pos.split(' ');
    const [longitude, latitude] = point;
    const kind = geoObject.metaDataProperty?.GeocoderMetaData?.kind;
    const addressName = geoObject.name || '';
    
    console.log('📍 Координаты:', latitude, longitude);
    console.log('🏷️ Kind:', kind);
    console.log('📛 Название:', addressName);
    
    // Шаг 2: Поиск организаций поблизости
    let foundType = null;
    let organizations = [];
    
    try {
      const searchResponse = await fetch(
        `https://search-maps.yandex.ru/v1/?apikey=${YANDEX_API_KEY}&text=организация&ll=${longitude},${latitude}&spn=0.005,0.005&type=biz&results=10`
      );
      const searchData = await searchResponse.json();
      organizations = searchData.features || [];
      
      console.log(`🏢 Найдено организаций рядом: ${organizations.length}`);
      
      // Анализируем названия организаций
      for (const org of organizations) {
        const orgName = org.properties?.CompanyMetaData?.name || '';
        const orgCategory = org.properties?.CompanyMetaData?.Categories?.[0]?.name || '';
        
        const typeFromName = detectTypeByName(orgName);
        const typeFromCategory = detectTypeByName(orgCategory);
        
        if (typeFromName) {
          foundType = typeFromName;
          console.log(`✅ Определено по названию "${orgName}": ${foundType}`);
          break;
        }
        if (typeFromCategory && !foundType) {
          foundType = typeFromCategory;
          console.log(`✅ Определено по категории "${orgCategory}": ${foundType}`);
        }
      }
    } catch (searchError) {
      console.warn('⚠️ Ошибка поиска организаций:', searchError);
    }
    
    // Шаг 3: Если не нашли по организациям, используем kind
    if (!foundType && kind) {
      foundType = detectTypeByKind(kind, addressName);
      if (foundType) {
        console.log(`✅ Определено по kind (${kind}): ${foundType}`);
      }
    }
    
    // Шаг 4: Если всё ещё не нашли, пытаемся по названию адреса
    if (!foundType && addressName) {
      foundType = detectTypeByName(addressName);
      if (foundType) {
        console.log(`✅ Определено по названию адреса: ${foundType}`);
      }
    }
    
    const finalType = foundType || 'other';
    const confidence = foundType ? 'medium' : 'low';
    
    console.log(`🎯 Итоговый тип: ${finalType} (достоверность: ${confidence})`);
    
    return {
      type: finalType,
      confidence: confidence,
      source: foundType ? 'auto' : 'default',
      kind: kind,
      addressName: addressName,
      organizationsCount: organizations.length
    };
    
  } catch (error) {
    console.error('❌ Ошибка определения типа здания:', error);
    return { type: 'other', confidence: 'low', source: 'error' };
  }
};

// Расчет стоимости
export const calculatePrice = (buildingType, cameras = 0, staff = 0) => {
  const config = PRICE_CONFIG[buildingType] || PRICE_CONFIG['other'];
  const total = config.base + (cameras * config.perCamera) + (staff * config.perStaff);
  
  return {
    base: config.base,
    camerasCost: cameras * config.perCamera,
    staffCost: staff * config.perStaff,
    total: total,
    config: config
  };
};

// Форматирование цены
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
};
