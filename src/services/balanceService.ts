import axios from 'axios';
import CryptoJS from 'crypto-js';

const BALANCE_SERVICE_URL = import.meta.env.VITE_BALANCE_SERVICE_URL || 'http://localhost:8080';
const GAME_ID = import.meta.env.VITE_GAME_ID || 'test_game';
const API_SECRET = import.meta.env.VITE_API_SECRET;

const api = axios.create({
  baseURL: `${BALANCE_SERVICE_URL}/api`,
});

api.interceptors.request.use((config) => {
  if (API_SECRET) {
    const body = config.data ? JSON.stringify(config.data) : '';
    const signature = CryptoJS.HmacSHA256(body, API_SECRET).toString(CryptoJS.enc.Hex);
    config.headers['X-Game-Id'] = GAME_ID;
    config.headers['X-Api-Signature'] = signature;
  }
  return config;
});

export const getBalance = (telegramId: number) => {
  return api.get(`/balance/${telegramId}`);
};

export const getTransactions = (telegramId: number) => {
  return api.get(`/balance/transactions/${telegramId}`);
};

export const createDeposit = (telegramId: number, amount: number) => {
  return api.post('/balance/deposit/playdeck', { telegramId, amount });
};

export const requestWithdrawal = (telegramId: number, amount: number) => {
  return api.post('/balance/withdraw', { telegramId, amount });
}; 