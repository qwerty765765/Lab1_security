import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { securityAPI } from '../services/api';
import ClipLoader from 'react-spinners/ClipLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const Form = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    cameras: '',
    staff: '',
    status: 'active',
    description: '',
    emergency_contacts: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Функция для валидации номера телефона (упрощенная версия без экранирования)
  const validatePhoneNumber = (phone) => {
    if (!phone) return true;
    // Упрощенная проверка: номер должен содержать только цифры, пробелы, +, -, (, )
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 || digits.length === 10;
  };

  const loadSecurityObject = async () => {
    try {
      setLoading(true);
      const data = await securityAPI.getById(id);
      setFormData({
        name: data.name || '',
        type: data.type || '',
        address: data.address || '',
        cameras: data.cameras || '',
        staff: data.staff || '',
        status: data.status || 'active',
        description: data.description || '',
        emergency_contacts: data.emergency_contacts || ''
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      loadSecurityObject();
    }
  }, [id, isEditMode]); // Добавляем isEditMode в зависимости

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Название обязательно для заполнения';
    } else if (formData.name.length < 3) {
      errors.name = 'Название должно содержать минимум 3 символа';
    }
    
    if (!formData.type.trim()) {
      errors.type = 'Выберите тип системы безопасности';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Адрес обязателен для заполнения';
    }
    
    if (formData.cameras) {
      const camerasNum = Number(formData.cameras);
      if (isNaN(camerasNum) || camerasNum < 0 || !Number.isInteger(camerasNum)) {
        errors.cameras = 'Количество камер должно быть целым положительным числом';
      }
    }
    
    if (formData.staff) {
      const staffNum = Number(formData.staff);
      if (isNaN(staffNum) || staffNum < 0 || !Number.isInteger(staffNum)) {
        errors.staff = 'Количество сотрудников должно быть целым положительным числом';
      }
    }
    
    if (formData.emergency_contacts && !validatePhoneNumber(formData.emergency_contacts)) {
      errors.emergency_contacts = 'Введите корректный номер телефона (10 или 11 цифр)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const firstError = document.querySelector('.error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const submitData = {
        ...formData,
        cameras: formData.cameras ? Number(formData.cameras) : 0,
        staff: formData.staff ? Number(formData.staff) : 0
      };
      
      if (isEditMode) {
        await securityAPI.update(id, submitData);
      } else {
        await securityAPI.create(submitData);
      }
      
      navigate('/');
    } catch (err) {
      setError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Упрощенная функция форматирования телефона
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '');
    
    let formatted = value;
    if (digits.length > 0) {
      if (digits.length <= 1) {
        formatted = digits;
      } else if (digits.length <= 4) {
        formatted = `+7 (${digits.slice(1)})`;
      } else if (digits.length <= 7) {
        formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
      } else if (digits.length <= 9) {
        formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
      } else {
        formatted = `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      emergency_contacts: formatted
    }));
    
    if (validationErrors.emergency_contacts) {
      setValidationErrors(prev => ({
        ...prev,
        emergency_contacts: null
      }));
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="spinner-container">
        <ClipLoader color="#667eea" size={50} />
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{isEditMode ? '✏️ Редактирование объекта' : '➕ Добавление нового объекта'}</h2>
      
      {error && (
        <ErrorDisplay error={error} onDismiss={() => setError(null)} />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название объекта *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${validationErrors.name ? 'error' : ''}`}
            placeholder="Например: ЖК 'Безопасный дом'"
            maxLength="100"
          />
          {validationErrors.name && (
            <span className="error-message">{validationErrors.name}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>Тип системы безопасности *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`form-control ${validationErrors.type ? 'error' : ''}`}
          >
            <option value="">Выберите тип</option>
            <option value="Видеонаблюдение">📹 Видеонаблюдение</option>
            <option value="Контроль доступа">🔐 Контроль доступа</option>
            <option value="Охранная сигнализация">🚨 Охранная сигнализация</option>
            <option value="Пожарная безопасность">🔥 Пожарная безопасность</option>
            <option value="Комплексная система">🏢 Комплексная система</option>
          </select>
          {validationErrors.type && (
            <span className="error-message">{validationErrors.type}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>Адрес *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`form-control ${validationErrors.address ? 'error' : ''}`}
            placeholder="ул. Примерная, д. 1"
          />
          {validationErrors.address && (
            <span className="error-message">{validationErrors.address}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>Количество камер видеонаблюдения</label>
          <input
            type="number"
            name="cameras"
            value={formData.cameras}
            onChange={handleChange}
            className={`form-control ${validationErrors.cameras ? 'error' : ''}`}
            placeholder="0"
            min="0"
            step="1"
          />
          {validationErrors.cameras && (
            <span className="error-message">{validationErrors.cameras}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>Количество сотрудников охраны</label>
          <input
            type="number"
            name="staff"
            value={formData.staff}
            onChange={handleChange}
            className={`form-control ${validationErrors.staff ? 'error' : ''}`}
            placeholder="0"
            min="0"
            step="1"
          />
          {validationErrors.staff && (
            <span className="error-message">{validationErrors.staff}</span>
          )}
        </div>
        
        <div className="form-group">
          <label>Статус</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-control"
          >
            <option value="active">🟢 Активен</option>
            <option value="inactive">🔴 Неактивен</option>
            <option value="maintenance">🟡 На обслуживании</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Описание</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Дополнительная информация о системе безопасности..."
            maxLength="500"
          />
        </div>
        
        <div className="form-group">
          <label>Аварийные контакты</label>
          <input
            type="tel"
            name="emergency_contacts"
            value={formData.emergency_contacts}
            onChange={handlePhoneChange}
            className={`form-control ${validationErrors.emergency_contacts ? 'error' : ''}`}
            placeholder="+7 (XXX) XXX-XX-XX"
          />
          {validationErrors.emergency_contacts && (
            <span className="error-message">{validationErrors.emergency_contacts}</span>
          )}
          <small style={{ color: '#666', fontSize: '12px' }}>
            Формат: +7 (XXX) XXX-XX-XX или 8XXXXXXXXXX
          </small>
        </div>
        
        <div className="card-actions">
          <button 
            type="submit" 
            className="btn btn-success" 
            disabled={loading}
          >
            {loading ? 'Сохранение...' : (isEditMode ? '💾 Обновить' : '✅ Создать')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="btn btn-primary"
            disabled={loading}
          >
            ❌ Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
