// src/components/YandexMap.js
import React, { useState, useEffect } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const YandexMap = ({ address, height = '450px' }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const YANDEX_API_KEY = '5f4a6554-9ed8-4a68-b2b3-2d2f6118d973'; // ваш новый ключ

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }

    const geocodeAddress = async () => {
      setLoading(true);
      setError(false);

      try {
        const response = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(address)}&format=json`
        );
        const data = await response.json();
        
        const geoObject = data.response.GeoObjectCollection.featureMember[0];
        
        if (geoObject) {
          const position = geoObject.GeoObject.Point.pos.split(' ');
          setCoordinates([parseFloat(position[1]), parseFloat(position[0])]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
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
      <div style={{ height, background: '#f8d7da', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#721c24' }}>
        ⚠️ Адрес не найден: {address}
      </div>
    );
  }

  return (
    <div 
      className="yandex-map-container"
      style={{ 
        marginTop: '15px', 
        width: '100%', 
        height: height,
        position: 'relative'
      }}
    >
      <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
        🗺️ Расположение на карте:
      </label>
      <div style={{ height: `calc(${height} - 30px)`, width: '100%' }}>
        <YMaps query={{ apikey: YANDEX_API_KEY }}>
          <Map
            state={{ center: coordinates, zoom: 15 }}
            width="100%"
            height="100%"
            options={{ 
              suppressMapOpenBlock: true,
              yandexMapDisablePoiInteractivity: true
            }}
            style={{ 
              borderRadius: '8px', 
              overflow: 'hidden', 
              border: '1px solid #ddd',
              height: '100%',
              width: '100%'
            }}
          >
            <Placemark 
              geometry={coordinates} 
              properties={{
                balloonContent: `<strong>📍 ${address}</strong>`
              }}
              options={{ preset: 'islands#redIcon' }}
            />
          </Map>
        </YMaps>
      </div>
    </div>
  );
};

export default YandexMap;
