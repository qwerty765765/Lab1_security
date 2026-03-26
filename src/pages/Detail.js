import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { securityAPI } from '../services/api';
import ClipLoader from 'react-spinners/ClipLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [securityObject, setSecurityObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSecurityObject();
  }, [id]);

  const loadSecurityObject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await securityAPI.getById(id);
      setSecurityObject(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div>
        <ErrorDisplay error={error} />
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/" className="btn btn-primary">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  if (!securityObject) {
    return (
      <div className="card">
        <h2>❌ Объект не найден</h2>
        <p>Запрашиваемый объект безопасности не существует или был удален.</p>
        <Link to="/" className="btn btn-primary">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>{securityObject.name}</h2>
        <div className={`status ${getStatusColor(securityObject.status)}`} style={{ marginBottom: '20px', display: 'inline-block' }}>
          {getStatusText(securityObject.status)}
        </div>
        
        <div className="form-group">
          <label>🏷️ Тип системы безопасности:</label>
          <p><strong>{securityObject.type}</strong></p>
        </div>
        
        <div className="form-group">
          <label>📍 Адрес:</label>
          <p>{securityObject.address}</p>
        </div>
        
        <div className="form-group">
          <label>📹 Количество камер видеонаблюдения:</label>
          <p>{securityObject.cameras} шт.</p>
        </div>
        
        <div className="form-group">
          <label>👥 Количество сотрудников охраны:</label>
          <p>{securityObject.staff} чел.</p>
        </div>
        
        <div className="form-group">
          <label>📝 Описание системы:</label>
          <p>{securityObject.description || 'Описание отсутствует'}</p>
        </div>
        
        {securityObject.emergency_contacts && (
          <div className="form-group">
            <label>🚨 Аварийные контакты:</label>
            <p><strong>{securityObject.emergency_contacts}</strong></p>
          </div>
        )}
        
        <div className="card-actions">
          <Link to={`/edit/${securityObject.id}`} className="btn btn-warning">
            ✏️ Редактировать
          </Link>
          <Link to="/" className="btn btn-primary">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Detail;
