import { useState } from 'react';

export const useBedrockPath = () => {
  const [path, setPath] = useState<string | null>(null);

  const checkPath = async () => {
    try {
      // Simulación de búsqueda de conexión local.
      // Cuando tengas el backend nativo, aquí harás: fetch('http://localhost:PORT/status')
      setPath("Buscando cliente local de inyección...");
      
      // Simula que no encuentra nada (comportamiento normal en Vercel puro)
      setTimeout(() => {
        setPath("Cliente local desconectado");
      }, 1500);

    } catch (e) {
      setPath("Error: " + e);
    }
  };

  return { path, checkPath };
};