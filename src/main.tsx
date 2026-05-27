import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Manejar errores globales de audio/Howler en Android
if (/Android/i.test(navigator.userAgent)) {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('Audio') || event.message?.includes('pool')) {
      console.warn('Audio error on Android - ignoring:', event.message);
      event.preventDefault();
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Audio') || event.reason?.message?.includes('Howl')) {
      console.warn('Howler error on Android - ignoring:', event.reason);
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
