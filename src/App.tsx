import { useEffect, useState } from 'react';
import { environmentService } from './services/EnvironmentService';
import { Profile } from './types/playdeck';

function App() {
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const handleProfile = (event: Event) => {
      const customEvent = event as CustomEvent<Profile | null>;
      const profile = customEvent.detail;

      if (profile) {
        console.log('Profile received:', profile);
        setStatus(`ОК, ID: ${profile.telegramId}`);
      } else {
        console.log('Standalone mode or profile not available.');
        setStatus('ОК (Standalone)');
      }
    };
    
    window.addEventListener('playdeck:profile', handleProfile);
    
    const initialize = async () => {
        console.log('Initializing Environment Service...');
        await environmentService.initializePlatformService();
    };

    initialize();

    return () => {
      window.removeEventListener('playdeck:profile', handleProfile);
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem', textAlign: 'center' }}>
      <h1>{status}</h1>
    </div>
  );
}

export default App;
