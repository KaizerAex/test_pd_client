import React, { useEffect, useState } from 'react';
import { playdeckService } from './services/playdeckService';
import { useUserStore } from './store/userStore';
import * as balanceService from './services/balanceService';

function App() {
  const { telegramId, balance, transactions, setTelegramId, setBalance, setTransactions } = useUserStore();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    playdeckService.init().then(profile => {
      if (profile) {
        setTelegramId(profile.telegramId);
      }
    });
  }, [setTelegramId]);

  useEffect(() => {
    if (telegramId) {
      balanceService.getBalance(telegramId).then(response => {
        setBalance(response.data.balance);
      });
      balanceService.getTransactions(telegramId).then(response => {
        setTransactions(response.data);
      });
    }
  }, [telegramId, setBalance, setTransactions]);

  const handleDeposit = async () => {
    if (telegramId && depositAmount) {
      const amount = parseInt(depositAmount, 10);
      const response = await balanceService.createDeposit(telegramId, amount);
      const { externalId, description } = response.data;
      playdeckService.requestPayment(amount, description, externalId);
    }
  };

  const handleWithdraw = () => {
    if (telegramId && withdrawAmount) {
      balanceService.requestWithdrawal(telegramId, parseInt(withdrawAmount, 10));
    }
  };
  
  return (
    <div>
      <h1>Test Game</h1>
      {telegramId ? (
        <div>
          <div className="section">
            <h2>Balance: {balance !== null ? balance : 'Loading...'}</h2>
          </div>
          <div className="section">
            <h2>Actions</h2>
            <div>
              <input 
                type="number" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(e.target.value)} 
                placeholder="Deposit Amount" 
              />
              <button onClick={handleDeposit}>Deposit</button>
            </div>
            <div>
              <input 
                type="number" 
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(e.target.value)} 
                placeholder="Withdraw Amount" 
              />
              <button onClick={handleWithdraw}>Withdraw</button>
            </div>
          </div>
          <div className="section">
            <h2>Transactions</h2>
            <ul className="transactions-list">
              {transactions.map(tx => (
                <li key={tx.id} className="transaction-item">
                  {tx.type} - {tx.amount} - {tx.status}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p>Initializing with PlayDeck...</p>
      )}
    </div>
  );
}

export default App;
