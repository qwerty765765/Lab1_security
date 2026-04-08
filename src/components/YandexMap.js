// src/components/YandexMap.js
import React, { useState, useEffect } from 'react';

const YandexMap = ({ address, height = '350px' }) => {
  const [mapUrl, setMapUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [foundAddress, setFoundAddress] = useState('');

  const YANDEX_API_KEY = '5f4a6554-9ed8-4a68-b2b3-2d2f6118d973';

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const geocodeAddress = async () => {
      setLoading(true);
      setError(false);

      try {
        // 1. Сначала получаем координаты по адресу (Геокодер)
        const geocodeUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        const geoObject = data.response.GeoObjectCollection.featureMember[0];

        if (geoObject && geoObject.GeoObject.Point) {
          const position = geoObject.GeoObject.Point.pos.split(' ');
          const longitude = position[0];
          const latitude = position[1];
          const formattedAddress = geoObject.GeoObject.metaDataProperty.GeocoderMetaData.text;
          
          setFoundAddress(formattedAddress);

          // 2. Формируем URL для Static API (готовая картинка карты)
          //    Размер 600x400, масштаб 16, добавляем метку
          const staticMapUrl = `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&z=16&size=600,400&l=map&pt=${longitude},${latitude},pm2rdm`;
          setMapUrl(staticMapUrl);
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

  if (error || !mapUrl) {
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

  return (
    <div style={{ marginTop: '15px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
        🗺️ Расположение на карте:
      </label>
      <div style={{ 
        borderRadius: '8px', 
        overflow: 'hidden', 
        border: '1px solid #ddd',
        background: '#f8f9fa',
        textAlign: 'center'
      }}>
        <img 
          src={mapUrl} 
          alt={`Карта: ${foundAddress || address}`}
          style={{ 
            width: '100%', 
            height: 'auto', 
            display: 'block',
            cursor: 'pointer'
          }}
          onClick={() => {
            // При клике открываем Яндекс.Карты с этим адресом в новой вкладке
            const mapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(foundAddress || address)}`;
            window.open(mapsUrl, '_blank');
          }}
        />
        <div style={{ 
          padding: '8px', 
          fontSize: '12px', 
          color: '#666',
          borderTop: '1px solid #eee',
          background: 'white'
        }}>
          📍 {foundAddress || address}
          <br/>
          <small>🔍 Нажмите на карту, чтобы открыть в Яндекс.Картах</small>
        </div>
      </div>
    </div>
  );
};

export default YandexMap;
