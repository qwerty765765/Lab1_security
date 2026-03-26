import axios from 'axios';

// Определяем базовый URL в зависимости от окружения
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api/security';
  }
  return 'http://localhost:5000/security';
};

const API_BASE_URL = getBaseUrl();

// Создаем экземпляр axios с настройками по умолчанию
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Перехватчик для обработки ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Создаем объект ошибки с дополнительной информацией
    const customError = {
      message: '',
      status: null,
      statusText: '',
      data: null,
      timestamp: new Date().toISOString()
    };
    
    if (error.response) {
      // Сервер ответил с кодом ошибки
      customError.status = error.response.status;
      customError.statusText = error.response.statusText;
      customError.data = error.response.data;
      
      // Обработка разных статусов
      switch (error.response.status) {
        case 400:
          customError.message = 'Некорректный запрос. Проверьте введенные данные.';
          break;
        case 401:
          customError.message = 'Не авторизован. Требуется аутентификация.';
          break;
        case 403:
          customError.message = 'Доступ запрещен. У вас нет прав для этого действия.';
          break;
        case 404:
          customError.message = 'Запрашиваемый ресурс не найден. Возможно, объект был удален.';
          break;
        case 409:
          customError.message = 'Конфликт данных. Объект с такими данными уже существует.';
          break;
        case 422:
          customError.message = 'Ошибка валидации. Проверьте правильность заполнения полей.';
          break;
        case 500:
          customError.message = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
          break;
        case 502:
          customError.message = 'Ошибка шлюза. Сервер временно недоступен.';
          break;
        case 503:
          customError.message = 'Сервис временно недоступен. Попробуйте позже.';
          break;
        case 504:
          customError.message = 'Время ожидания ответа истекло. Сервер не отвечает.';
          break;
        default:
          customError.message = error.response.data?.message || `Ошибка ${error.response.status}: ${error.response.statusText}`;
      }
      
      console.error(`API Error ${customError.status}:`, customError);
      
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      customError.status = 0;
      customError.message = 'Нет связи с сервером. Проверьте подключение к интернету и запущен ли сервер.';
      console.error('Network Error:', error.request);
    } else {
      // Произошла ошибка при настройке запроса
      customError.status = -1;
      customError.message = 'Ошибка при отправке запроса: ' + error.message;
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(customError);
  }
);

export const securityAPI = {
  // Получение всех объектов безопасности
  getAll: async () => {
    const response = await axiosInstance.get('/');
    return response.data;
  },
  
  // Получение объекта по ID
  getById: async (id) => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  },
  
  // Создание нового объекта
  create: async (data) => {
    const response = await axiosInstance.post('/', data);
    return response.data;
  },
  
  // Обновление объекта
  update: async (id, data) => {
    const response = await axiosInstance.put(`/${id}`, data);
    return response.data;
  },
  
  // Удаление объекта
  delete: async (id) => {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  }
};
