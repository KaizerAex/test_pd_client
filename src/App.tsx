import { useEffect, useState } from 'react';
import { playdeckService } from './services/playdeckService';

function App() {
  const [status, setStatus] = useState('Initializing with PlayDeck...');

  useEffect(() => {
    console.log('Initializing PlayDeck service...');
    playdeckService.init().then(profile => {
      if (profile) {
        console.log('PlayDeck initialized, profile received:', profile);
        setStatus(`ОК, ID: ${profile.telegramId}`);
      } else {
        console.log('Running in standalone mode.');
        setStatus('ОК (Standalone)');
      }
    }).catch(error => {
        console.error('PlayDeck initialization failed:', error);
        setStatus('Error during initialization.');
    });
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem', textAlign: 'center' }}>
      <h1>{status}</h1>
    </div>
  );
}

export default App;
