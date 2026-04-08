// src/components/YandexMap.js
import React, { useState, useEffect } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const YandexMap = ({ address, height = '350px' }) => {
  const [coordinates, setCoordinates] = useState(null);
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
      setCoordinates(null);

      try {
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`;
        
        // ✅ ГЛАВНОЕ: явно указываем referrerPolicy для этого запроса
        const response = await fetch(url, {
          referrerPolicy: 'unsafe-url'
        });
        
        const data = await response.json();

        if (data.error) {
          console.error('API Error:', data.error);
          setError(true);
          setLoading(false);
          return;
        }

        const geoObject = data.response.GeoObjectCollection.featureMember[0];

        if (geoObject) {
          const position = geoObject.GeoObject.Point.pos.split(' ');
          setCoordinates([parseFloat(position[1]), parseFloat(position[0])]);
          setFoundAddress(geoObject.GeoObject.metaDataProperty.GeocoderMetaData.text);
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
      <div style={{ height, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#999' }}>
        📍 Адрес не указан
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ height, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
        ⏳ Загрузка карты...
      </div>
    );
  }

  if (error || !coordinates) {
    return (
      <div style={{ height, background: '#fff3cd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#856404' }}>
        ⚠️ Адрес не найден: {address}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '15px' }}>
      <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>🗺️ Расположение:</label>
      <YMaps query={{ apikey: YANDEX_API_KEY }}>
        <Map
          state={{ center: coordinates, zoom: 16 }}
          width="100%"
          height={height}
          options={{ suppressMapOpenBlock: true }}
          style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}
        >
          <Placemark 
            geometry={coordinates} 
            properties={{
              balloonContent: `<strong>📍 ${foundAddress || address}</strong>`
            }}
            options={{ preset: 'islands#redIcon' }}
          />
        </Map>
      </YMaps>
    </div>
  );
};

export default YandexMap;
