import { useState, useEffect } from 'react';

// Actualizamos la interfaz para incluir versión y ping
export interface ServerData {
  loading: boolean;
  online: boolean;
  players: number;
  max: number;
  version: string;
  ping: number;
}

export const useServerStatus = (ip: string) => {
  const [serverData, setServerData] = useState<ServerData>({
    loading: true, 
    online: false, 
    players: 0, 
    max: 0, 
    version: '...', 
    ping: 0
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const start = Date.now(); // Iniciamos cronómetro
        const res = await fetch(`https://api.mcsrvstat.us/bedrock/3/${ip}`);
        const data = await res.json();
        const ping = Date.now() - start; // Calculamos la latencia de la petición

        setServerData({ 
          loading: false, 
          online: data.online, 
          players: data.players?.online || 0, 
          max: data.players?.max || 0,
          version: data.version || 'Desconocida',
          ping: ping
        });
      } catch {
        setServerData(prev => ({ ...prev, loading: false, online: false }));
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [ip]);

  return serverData;
};