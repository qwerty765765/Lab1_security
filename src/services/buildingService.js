// src/services/buildingService.js

const YANDEX_API_KEY = '5f4a6554-9ed8-4a68-b2b3-2d2f6118d973';

export const PRICE_CONFIG = {
  'residential': { name: '🏠 Жилой дом', base: 5000, perCamera: 80, perStaff: 400 },
  'business_center': { name: '🏢 Бизнес-центр', base: 15000, perCamera: 200, perStaff: 1000 },
  'shopping_center': { name: '🛍️ Торговый центр', base: 20000, perCamera: 180, perStaff: 900 },
  'industrial': { name: '🏭 Промышленное', base: 12000, perCamera: 150, perStaff: 700 },
  'education': { name: '🏫 Образование', base: 8000, perCamera: 100, perStaff: 500 },
  'medical': { name: '🏥 Медицина', base: 10000, perCamera: 120, perStaff: 600 },
  'culture': { name: '🎭 Культура', base: 7000, perCamera: 90, perStaff: 450 },
  'sport': { name: '🏟️ Спорт', base: 9000, perCamera: 110, perStaff: 550 },
  'government': { name: '🏛️ Администрация', base: 12000, perCamera: 140, perStaff: 700 },
  'transport': { name: '🚗 Транспорт', base: 11000, perCamera: 130, perStaff: 650 },
  'service': { name: '🔧 Сервис', base: 6000, perCamera: 85, perStaff: 425 },
  'warehouse': { name: '📦 Склад', base: 8500, perCamera: 100, perStaff: 500 },
  'other': { name: '📋 Другое', base: 7000, perCamera: 100, perStaff: 500 }
};

export const detectBuildingType = async (address) => {
  try {
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`
    );
    const data = await response.json();
    const geoObject = data.response.GeoObjectCollection.featureMember[0]?.GeoObject;
    
    if (!geoObject) return { type: 'other' };
    
    const name = (geoObject.name || '').toLowerCase();
    
    if (name.includes('бизнес') || name.includes('офис')) return { type: 'business_center' };
    if (name.includes('торговый') || name.includes('тц')) return { type: 'shopping_center' };
    if (name.includes('жилой') || name.includes('жк')) return { type: 'residential' };
    if (name.includes('завод') || name.includes('фабрика')) return { type: 'industrial' };
    if (name.includes('школа') || name.includes('университет')) return { type: 'education' };
    if (name.includes('больница') || name.includes('клиника')) return { type: 'medical' };
    if (name.includes('стадион') || name.includes('спорт')) return { type: 'sport' };
    
    return { type: 'other' };
  } catch (error) {
    return { type: 'other' };
  }
};

export const calculatePrice = (buildingType, cameras = 0, staff = 0) => {
  const config = PRICE_CONFIG[buildingType] || PRICE_CONFIG.other;
  return {
    base: config.base,
    camerasCost: cameras * config.perCamera,
    staffCost: staff * config.perStaff,
    total: config.base + (cameras * config.perCamera) + (staff * config.perStaff),
    config
  };
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
};
