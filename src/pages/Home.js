import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { securityAPI } from '../services/api';
import ClipLoader from 'react-spinners/ClipLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const Home = () => {
  const [securityObjects, setSecurityObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSecurityObjects();
  }, []);

  const loadSecurityObjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await securityAPI.getAll();
      setSecurityObjects(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Вы уверены, что хотите удалить объект "${name}"?`)) {
      try {
        await securityAPI.delete(id);
        setSecurityObjects(securityObjects.filter(item => item.id !== id));
        setSuccessMessage(`Объект "${name}" успешно удален`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err);
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'maintenance': return 'status-maintenance';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return '🟢 Активен';
      case 'inactive': return '🔴 Неактивен';
      case 'maintenance': return '🟡 На обслуживании';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#667eea" size={50} />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: 'white', marginBottom: '30px', textAlign: 'center' }}>
        Системы безопасности
      </h1>
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      {error && (
        <ErrorDisplay error={error} onDismiss={() => setError(null)} />
      )}

      <div className="security-list">
        {securityObjects.map(item => (
          <div key={item.id} className="security-card">
            <h3>{item.name}</h3>
            <p><strong>Тип:</strong> {item.type}</p>
            <p><strong>Адрес:</strong> {item.address}</p>
            <p><strong>📹 Камеры:</strong> {item.cameras}</p>
            <p><strong>👥 Персонал:</strong> {item.staff} чел.</p>
            <div className={`status ${getStatusColor(item.status)}`}>
              {getStatusText(item.status)}
            </div>
            <div className="card-actions">
              <Link to={`/detail/${item.id}`} className="btn btn-primary">
                Подробнее
              </Link>
              <Link to={`/edit/${item.id}`} className="btn btn-warning">
                ✏️ Редактировать
              </Link>
              <button 
                onClick={() => handleDelete(item.id, item.name)} 
                className="btn btn-danger"
              >
                🗑️ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {securityObjects.length === 0 && !loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '15px' }}>Нет добавленных объектов безопасности</p>
          <Link to="/add" className="btn btn-primary">
            ➕ Добавить первый объект
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;
