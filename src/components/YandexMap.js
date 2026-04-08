// src/components/YandexMap.js
import React, { useState, useEffect } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const YandexMap = ({ address, height = '350px' }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [foundAddress, setFoundAddress] = useState('');

  // ✅ ВАШ НОВЫЙ РАБОЧИЙ КЛЮЧ (замените, если нужно)
  const YANDEX_API_KEY = '5f4a6554-9ed8-4a68-b2b3-2d2f6118d973';

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const geocodeAddress = async () => {
      setLoading(true);
      setError(false);
      setCoordinates(null);

      try {
        // ✅ ЯВНЫЙ ЗАПРОС К ГЕОКОДЕРУ С ВАШИМ КЛЮЧОМ
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`;
        const response = await fetch(url);
        const data = await response.json();

        // Проверяем, есть ли ошибка в ответе
        if (data.error) {
          console.error('API Error:', data.error);
          setError(true);
          setLoading(false);
          return;
        }

        const geoObject = data.response.GeoObjectCollection.featureMember[0];

        if (geoObject) {
          const position = geoObject.GeoObject.Point.pos.split(' ');
          // Яндекс возвращает "Долгота Широта", а карте нужно [Широта, Долгота]
          setCoordinates([parseFloat(position[1]), parseFloat(position[0])]);
          setFoundAddress(geoObject.GeoObject.metaDataProperty.GeocoderMetaData.text);
        } else {
          console.log('Адрес не найден:', address);
          setError(true);
        }
      } catch (err) {
        console.error('Ошибка геокодирования:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  // Если адрес не указан
  if (!address) {
    return (
      <div style={{ 
        height, 
        background: '#f5f5f5', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        color: '#999'
      }}>
        📍 Адрес не указан
      </div>
    );
  }

  // Показываем загрузку
  if (loading) {
    return (
      <div style={{ 
        height, 
        background: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '10px',
        borderRadius: '8px'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid #e0e0e0',
          borderTop: '3px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ color: '#666' }}>Загрузка карты...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Показываем ошибку, если адрес не найден
  if (error || !coordinates) {
    return (
      <div style={{ 
        height, 
        background: '#fff3cd', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        borderRadius: '8px',
        color: '#856404',
        padding: '15px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '24px' }}>⚠️</span>
        <span>Адрес не найден на карте</span>
        <small style={{ fontSize: '12px', marginTop: '5px' }}>{address}</small>
        <small style={{ fontSize: '11px', marginTop: '10px', color: '#999' }}>
          💡 Попробуйте указать более точный адрес
        </small>
      </div>
    );
  }

  // Отображаем карту с меткой
  return (
    <div style={{ marginTop: '15px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
        🗺️ Расположение на карте:
      </label>
      <YMaps query={{ apikey: YANDEX_API_KEY }}>
        <Map
          state={{ center: coordinates, zoom: 16, controls: ['zoomControl', 'fullscreenControl'] }}
          width="100%"
          height={height}
          options={{ 
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true
          }}
          style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}
        >
          <Placemark 
            geometry={coordinates} 
            properties={{
              balloonContent: `
                <div style="font-family: Arial, sans-serif; max-width: 250px;">
                  <strong style="color: #333;">📍 Объект безопасности</strong>
                  <hr style="margin: 8px 0;">
                  <span style="font-size: 13px; color: #666;">${foundAddress || address}</span>
                </div>
              `,
              hintContent: foundAddress || address
            }}
            options={{ 
              preset: 'islands#redIcon',
              openBalloonOnClick: true
            }}
          />
        </Map>
      </YMaps>
    </div>
  );
};

export default YandexMap;
