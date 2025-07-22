import { useEffect, useState, useCallback } from 'react';
import { playdeckService } from './services/playdeckService';
import { useUserStore } from './store/userStore';
import * as balanceService from './services/balanceService';
import { Profile } from './types/playdeck';

function App() {
  const { 
    telegramId, 
    balance, 
    transactions, 
    setTelegramId, 
    setBalance, 
    setTransactions 
  } = useUserStore();

  const [depositAmount, setDepositAmount] = useState('10');
  const [withdrawAmount, setWithdrawAmount] = useState('5');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async (tgId: number) => {
    try {
      const balanceRes = await balanceService.getBalance(tgId);
      setBalance(balanceRes.data.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(null);
    }
    try {
      const txRes = await balanceService.getTransactions(tgId);
      setTransactions(txRes.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    }
  }, [setBalance, setTransactions]);

  useEffect(() => {
    const handleProfile = (event: Event) => {
      const customEvent = event as CustomEvent<Profile | null>;
      const profile = customEvent.detail;

      setIsLoading(false);
      if (profile) {
        console.log('Profile received:', profile);
        setTelegramId(profile.telegramId);
        fetchUserData(profile.telegramId);
      } else {
        console.log('Standalone mode or profile not available.');
        setTelegramId(null);
      }
    };
    
    window.addEventListener('playdeck:profile', handleProfile);
    playdeckService.init();

    return () => {
      window.removeEventListener('playdeck:profile', handleProfile);
    };
  }, [setTelegramId, fetchUserData]);

  const handleDeposit = async () => {
    if (telegramId && depositAmount) {
      const amount = parseInt(depositAmount, 10);
      try {
        const response = await balanceService.createDeposit(telegramId, amount);
        const { externalId, description } = response.data;
        playdeckService.requestPayment(amount, description, externalId);
      } catch (error) {
        console.error('Failed to create deposit:', error);
        alert('Failed to create deposit. See console for details.');
      }
    }
  };

  const handleWithdraw = async () => {
    if (telegramId && withdrawAmount) {
      try {
        await balanceService.requestWithdrawal(telegramId, parseInt(withdrawAmount, 10));
        alert('Withdrawal request sent!');
        fetchUserData(telegramId);
      } catch (error) {
        console.error('Failed to request withdrawal:', error);
        alert('Failed to request withdrawal. See console for details.');
      }
    }
  };
  
  if (isLoading) {
    return <div><h1>Initializing...</h1></div>;
  }

  if (!telegramId) {
    return <div><h1>OK (Standalone)</h1><p>Running outside of PlayDeck environment.</p></div>;
  }

  return (
    <div>
      <h1>Test Game (ID: {telegramId})</h1>
      
      <div className="section">
        <h2>Balance: {balance !== null ? balance.toFixed(2) : 'Loading...'}</h2>
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
        <h2>Last 5 Transactions</h2>
        <ul className="transactions-list">
          {transactions.slice(0, 5).map(tx => (
            <li key={tx.id} className="transaction-item">
              <span>{new Date(tx.createdAt).toLocaleString()}</span>
              <span>{tx.type}</span>
              <span>Amount: {tx.amount}</span>
              <span>Status: {tx.status}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => fetchUserData(telegramId)}>Refresh All</button>
      </div>
    </div>
  );
}

export default App;
