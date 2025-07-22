import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_SECRET = import.meta.env.VITE_API_SECRET;
const BALANCE_SERVICE_URL = import.meta.env.VITE_BALANCE_SERVICE_URL;
const GAME_ID = import.meta.env.VITE_GAME_ID;

console.log('VITE_BALANCE_SERVICE_URL from .env:', BALANCE_SERVICE_URL);

const api = axios.create({
  baseURL: BALANCE_SERVICE_URL,
});

api.interceptors.request.use((config) => {
  if (!API_SECRET) {
    throw new Error('Missing VITE_API_SECRET in .env file');
  }
  if (!GAME_ID) {
    throw new Error('Missing VITE_GAME_ID in .env file');
  }
  if (!BALANCE_SERVICE_URL) {
    throw new Error('Missing or empty VITE_BALANCE_SERVICE_URL in .env file');
  }

  config.params = { ...config.params, gameId: GAME_ID };

  let dataToSign = '';
  if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
    dataToSign = JSON.stringify(config.data);
  } else {
    // For GET, DELETE requests
    if (config.params) {
      const sortedParams = new URLSearchParams();
      Object.keys(config.params).sort().forEach(key => {
        sortedParams.append(key, config.params[key]);
      });
      dataToSign = sortedParams.toString();
    }
  }
  
  const signature = CryptoJS.HmacSHA256(dataToSign, API_SECRET).toString(CryptoJS.enc.Hex);
  console.log(dataToSign);
  config.headers['x-request-signature'] = signature;
  
  return config;
});

export const getBalance = async (telegramId: string) => {
  const response = await api.get('/balance/balance', {
    params: { telegramId },
  });
  return response.data;
};

export const getTransactions = async (telegramId: string, limit: number = 20, offset: number = 0) => {
  const response = await api.get('/transactions', {
    params: { telegramId, limit, offset },
  });
  return response.data;
};

export const createInvoice = async (telegramId: string, amount: number) => {
  const response = await api.post('/playdeck/invoices', { telegramId, amount });
  return response.data;
};

export const requestWithdrawal = async (telegramId: string, amount: number) => {
  const response = await api.post('/balance/withdraw', { telegramId, amount });
  return response.data;
}; 