import React from 'react';

const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null;
  
  const getErrorIcon = () => {
    if (error.status === 404) return '🔍';
    if (error.status === 500) return '💥';
    if (error.status === 401 || error.status === 403) return '🔒';
    if (error.status === 400 || error.status === 422) return '⚠️';
    if (error.status === 0) return '🌐';
    return '❌';
  };
  
  const getErrorTitle = () => {
    if (error.status === 404) return 'Ресурс не найден (404)';
    if (error.status === 500) return 'Внутренняя ошибка сервера (500)';
    if (error.status === 401) return 'Не авторизован (401)';
    if (error.status === 403) return 'Доступ запрещен (403)';
    if (error.status === 400) return 'Некорректный запрос (400)';
    if (error.status === 422) return 'Ошибка валидации (422)';
    if (error.status === 0) return 'Ошибка соединения';
    return `Ошибка ${error.status || 'клиента'}`;
  };
  
  return (
    <div className="alert alert-error" style={{ 
      position: 'relative',
      padding: '15px',
      marginBottom: '20px',
      animation: 'slideIn 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '24px', flexShrink: 0 }}>
          {getErrorIcon()}
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
            {getErrorTitle()}
          </strong>
          <p style={{ marginBottom: '5px', color: '#721c24' }}>
            {error.message}
          </p>
          {error.status === 404 && (
            <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              💡 Совет: Проверьте правильность URL или обновите страницу
            </p>
          )}
          {error.status === 500 && (
            <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              💡 Совет: Попробуйте обновить страницу через несколько минут
            </p>
          )}
          {error.status === 0 && (
            <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              💡 Совет: Убедитесь, что сервер запущен командой: <code>npm run server</code>
            </p>
          )}
          {(error.status === 400 || error.status === 422) && (
            <p style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              💡 Совет: Проверьте правильность заполнения всех полей формы
            </p>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#721c24',
            padding: '0 5px',
            fontWeight: 'bold'
          }}
          aria-label="Закрыть"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
