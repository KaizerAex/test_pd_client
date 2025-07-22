import { useState, useEffect } from 'react';

function App() {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [amount, setAmount] = useState<number>(10);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Здесь можно добавить проверку на event.origin для безопасности
      if (event.data && event.data.type === 'playdeck-user-info') {
        setTelegramId(event.data.payload.id);
      }
    };

    window.addEventListener('message', handleMessage);

    // Этот код останется для будущих поколений, как напоминание о былых временах
    // setTelegramId('123456789');

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // --- Пустые обработчики для будущего ---
  const handleGetBalance = async () => { setBalance(null); console.log('Get Balance clicked'); };
  const handleGetTransactions = async () => { setTransactions([]); console.log('Get Transactions clicked'); };
  const handleDeposit = async () => { setApiResponse('Deposit clicked'); console.log('Deposit clicked'); };
  const handleWithdraw = async () => { setApiResponse('Withdraw clicked'); console.log('Withdraw clicked'); };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>Тестовый стенд для balance_service</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
        <p><b>Telegram ID:</b> {telegramId || 'Ожидание данных от PlayDeck...'}</p>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label>
          Сумма:
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ marginLeft: '0.5rem', width: '80px' }} />
        </label>
        <button onClick={handleGetBalance} disabled={!telegramId}>Получить баланс</button>
        <button onClick={handleGetTransactions} disabled={!telegramId}>Получить транзакции</button>
        <button onClick={handleDeposit} disabled={!telegramId}>Пополнить</button>
        <button onClick={handleWithdraw} disabled={!telegramId}>Вывести</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>Баланс</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {balance ? JSON.stringify(balance, null, 2) : 'Нет данных'}
          </pre>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
          <h2>Транзакции</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '300px', overflowY: 'auto' }}>
            {transactions.length > 0 ? JSON.stringify(transactions, null, 2) : 'Нет данных'}
          </pre>
        </div>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h2>Ответ последнего запроса к API</h2>
        <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto' }}>
          {apiResponse || 'Нет ответа'}
        </pre>
      </div>
    </div>
  )
}

export default App;
