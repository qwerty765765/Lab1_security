// src/components/YandexMap.js
import React, { useState, useEffect } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const YandexMap = ({ address, height = '350px' }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [foundAddress, setFoundAddress] = useState('');

  // Ваш API-ключ (скопирован из сообщения)
  const YANDEX_API_KEY = 'd4aed16a-fc62-4a39-b2fa-498c7cff8bef';

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
        const response = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`
        );
        const data = await response.json();

        const geoObject = data.response.GeoObjectCollection.featureMember[0];
        
        if (geoObject) {
          const position = geoObject.GeoObject.Point.pos.split(' ');
          const formattedAddress = geoObject.GeoObject.metaDataProperty.GeocoderMetaData.text;
          
          // Яндекс возвращает "Долгота Широта", меняем местами для карты
          setCoordinates([parseFloat(position[1]), parseFloat(position[0])]);
          setFoundAddress(formattedAddress);
        } else {
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

  // Показываем ошибку
  if (error || !coordinates) {
    return (
      <div style={{ 
        height, 
        background: '#f8d7da', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        borderRadius: '8px',
        color: '#721c24'
      }}>
        <span style={{ fontSize: '24px' }}>⚠️</span>
        <span>Адрес не найден на карте</span>
        <small style={{ fontSize: '12px', marginTop: '5px' }}>{address}</small>
      </div>
    );
  }

  // Отображаем карту
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
