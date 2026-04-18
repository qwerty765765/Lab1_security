import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { securityAPI } from '../services/api';
import ClipLoader from 'react-spinners/ClipLoader';
import ErrorDisplay from '../components/ErrorDisplay';
import { detectBuildingType, calculatePrice, PRICE_CONFIG, formatPrice } from '../services/buildingService';

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
    emergency_contacts: '',
    buildingType: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionInfo, setDetectionInfo] = useState(null);

  // Функция для валидации номера телефона
  const validatePhoneNumber = (phone) => {
    if (!phone) return true;
    
    // Исправленные регулярные выражения (без лишних экранирований)
    const phoneRegex = /^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/;
    const simplePhoneRegex = /^[\+\d\s()-]{10,20}$/;
    
    if (!phoneRegex.test(phone) && !simplePhoneRegex.test(phone)) {
      return false;
    }
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11 && digits.length !== 10) {
      return false;
    }
    
    return true;
  };

  const loadSecurityObject = useCallback(async () => {
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
        emergency_contacts: data.emergency_contacts || '',
        buildingType: data.buildingType || ''
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      loadSecurityObject();
    }
  }, [id, isEditMode, loadSecurityObject]);

  // Обновляем цену при изменении типа, камер или сотрудников
  useEffect(() => {
    if (formData.buildingType) {
      const cameras = Number(formData.cameras) || 0;
      const staff = Number(formData.staff) || 0;
      const price = calculatePrice(formData.buildingType, cameras, staff);
      setPriceCalculation(price);
    } else {
      setPriceCalculation(null);
    }
  }, [formData.buildingType, formData.cameras, formData.staff]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Название обязательно для заполнения';
    } else if (formData.name.length < 3) {
      errors.name = 'Название должно содержать минимум 3 символа';
    } else if (formData.name.length > 100) {
      errors.name = 'Название не должно превышать 100 символов';
    }
    
    if (!formData.type.trim()) {
      errors.type = 'Выберите тип системы безопасности';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Адрес обязателен для заполнения';
    } else if (formData.address.length < 5) {
      errors.address = 'Введите полный адрес (минимум 5 символов)';
    }
    
    if (formData.cameras) {
      const camerasNum = Number(formData.cameras);
      if (isNaN(camerasNum)) {
        errors.cameras = 'Количество камер должно быть числом';
      } else if (camerasNum < 0) {
        errors.cameras = 'Количество камер не может быть отрицательным';
      } else if (!Number.isInteger(camerasNum)) {
        errors.cameras = 'Количество камер должно быть целым числом';
      } else if (camerasNum > 1000) {
        errors.cameras = 'Количество камер не может превышать 1000';
      }
    }
    
    if (formData.staff) {
      const staffNum = Number(formData.staff);
      if (isNaN(staffNum)) {
        errors.staff = 'Количество сотрудников должно быть числом';
      } else if (staffNum < 0) {
        errors.staff = 'Количество сотрудников не может быть отрицательным';
      } else if (!Number.isInteger(staffNum)) {
        errors.staff = 'Количество сотрудников должно быть целым числом';
      } else if (staffNum > 500) {
        errors.staff = 'Количество сотрудников не может превышать 500';
      }
    }
    
    if (formData.emergency_contacts && !validatePhoneNumber(formData.emergency_contacts)) {
      errors.emergency_contacts = 'Введите корректный номер телефона';
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

  // Автоопределение типа здания
  const handleAddressAutoDetect = async (addressValue) => {
    if (!addressValue || addressValue.length < 10) return;
    
    setIsDetecting(true);
    setDetectionInfo(null);
    
    try {
      const result = await detectBuildingType(addressValue);
      setFormData(prev => ({ ...prev, buildingType: result.type }));
      setDetectionInfo(result);
    } catch (err) {
      console.error('Ошибка автоопределения:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  // Обработчик изменения адреса с debounce
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, address: value }));
    
    if (validationErrors.address) {
      setValidationErrors(prev => ({ ...prev, address: null }));
    }
    
    clearTimeout(window.addressTimeout);
    window.addressTimeout = setTimeout(() => {
      handleAddressAutoDetect(value);
    }, 800);
  };

  const handleBuildingTypeChange = (e) => {
    setFormData(prev => ({ ...prev, buildingType: e.target.value }));
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

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 0) return '';
    
    if (digits.length <= 1) {
      return digits;
    } else if (digits.length <= 4) {
      return `+7 (${digits.slice(1)})`;
    } else if (digits.length <= 7) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    } else if (digits.length <= 9) {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    } else {
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
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
          <small style={{ color: '#666', fontSize: '12px' }}>
            {formData.name.length}/100 символов
          </small>
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
            onChange={handleAddressChange}
            className={`form-control ${validationErrors.address ? 'error' : ''}`}
            placeholder="г. Новосибирск, ул. Примерная, д. 1"
          />
          {validationErrors.address && (
            <span className="error-message">{validationErrors.address}</span>
          )}
          {isDetecting && (
            <small style={{ color: '#667eea', display: 'block', marginTop: '5px' }}>
              🔍 Определяем тип здания...
            </small>
          )}
          {detectionInfo && detectionInfo.type && detectionInfo.type !== 'other' && (
            <small style={{ color: '#28a745', display: 'block', marginTop: '5px' }}>
              ✅ Автоматически определен тип: {PRICE_CONFIG[formData.buildingType]?.name}
            </small>
          )}
        </div>
        
        {/* Блок выбора типа здания */}
        <div className="form-group">
          <label>🏢 Тип здания</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={formData.buildingType}
              onChange={handleBuildingTypeChange}
              className="form-control"
              style={{ flex: 2 }}
            >
              <option value="">Выберите тип здания</option>
              {Object.entries(PRICE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.name}</option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={() => handleAddressAutoDetect(formData.address)}
              disabled={isDetecting || !formData.address}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {isDetecting ? '🔍 Определяю...' : '🔍 Автоопределение'}
            </button>
          </div>
          
          {formData.buildingType && (
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              {PRICE_CONFIG[formData.buildingType]?.description}
            </small>
          )}
        </div>
        
        {/* Блок расчета стоимости */}
        {formData.buildingType && priceCalculation && (
          <div className="form-group" style={{ 
            background: '#f0f7ff', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
              💰 Расчет стоимости охраны в месяц
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Базовая ставка ({PRICE_CONFIG[formData.buildingType]?.name}):</span>
                <strong>{formatPrice(priceCalculation.base)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Камеры видеонаблюдения ({formData.cameras || 0} шт. × {formatPrice(PRICE_CONFIG[formData.buildingType]?.perCamera)}):</span>
                <strong>{formatPrice(priceCalculation.camerasCost)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Сотрудники охраны ({formData.staff || 0} чел. × {formatPrice(PRICE_CONFIG[formData.buildingType]?.perStaff)}):</span>
                <strong>{formatPrice(priceCalculation.staffCost)}</strong>
              </div>
              <hr style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                <span>ИТОГО в месяц:</span>
                <span style={{ color: '#28a745' }}>{formatPrice(priceCalculation.total)}</span>
              </div>
            </div>
          </div>
        )}
        
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
            max="1000"
            step="1"
          />
          {validationErrors.cameras && (
            <span className="error-message">{validationErrors.cameras}</span>
          )}
          <small style={{ color: '#666', fontSize: '12px' }}>
            От 0 до 1000 камер
          </small>
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
            max="500"
            step="1"
          />
          {validationErrors.staff && (
            <span className="error-message">{validationErrors.staff}</span>
          )}
          <small style={{ color: '#666', fontSize: '12px' }}>
            От 0 до 500 сотрудников
          </small>
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
          <small style={{ color: '#666', fontSize: '12px' }}>
            {formData.description.length}/500 символов
          </small>
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
