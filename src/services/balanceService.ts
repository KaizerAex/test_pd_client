import axios from 'axios';
import CryptoJS from 'crypto-js';

const BALANCE_SERVICE_URL = 'https://9xj4th3b-3000.inc1.devtunnels.ms/';
const GAME_ID = import.meta.env.VITE_GAME_ID || 'test_game';
const API_SECRET = import.meta.env.VITE_API_SECRET;

const api = axios.create({
  baseURL: `${BALANCE_SERVICE_URL}/api`,
});

api.interceptors.request.use((config) => {
  if (!API_SECRET) {
    console.error('API Secret is not defined. Please check your .env file.');
    return Promise.reject('API Secret is missing');
  }

  // Добавляем gameId в тело или параметры запроса
  if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
    config.data = { ...config.data, gameId: GAME_ID };
  } else if (config.method === 'get' || config.method === 'delete') {
    config.params = { ...config.params, gameId: GAME_ID };
  }
  
  // Создаем подпись на основе тела или параметров
  let dataToSign = '';
  if (config.method === 'get' || config.method === 'delete') {
    const params = new URLSearchParams(config.params as Record<string, string>);
    params.sort();
    dataToSign = params.toString();
  } else if (config.data && Object.keys(config.data).length > 0) {
    dataToSign = JSON.stringify(config.data);
  }

  const signature = CryptoJS.HmacSHA256(dataToSign, API_SECRET).toString();
  
  // Используем правильное имя заголовка
  config.headers['x-request-signature'] = signature;
  
  return config;
});

// GET-запросы теперь не требуют передачи gameId, interceptor сделает это за нас
export const getBalance = (telegramId: number) => {
  return api.get(`/balance/${telegramId}`);
};

export const getTransactions = (telegramId: number) => {
  return api.get(`/balance/transactions/${telegramId}`);
};

// POST-запросы также не требуют gameId в аргументах
export const createDeposit = (telegramId: number, amount: number) => {
  return api.post('/balance/deposit/playdeck', { telegramId, amount });
};

export const requestWithdrawal = (telegramId: number, amount: number) => {
  return api.post('/balance/withdraw', { telegramId, amount });
}; 