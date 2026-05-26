import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ClickRecord {
  x: number;
  y: number;
  timestamp: number;
}

export function TestCoordinatesModal({ onClose }: { onClose: () => void }) {
  const [resolution, setResolution] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [clicks, setClicks] = useState<ClickRecord[]>([]);
  const [saved, setSaved] = useState<{ x: number; y: number } | null>(null);

  const invokeTauri = async (command: string, args: any = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      const listener = (event: MessageEvent) => {
        if (event.data.type === 'TAURI_RESULT' && event.data.id === id) {
          window.removeEventListener('message', listener);
          resolve(event.data.result);
        } else if (event.data.type === 'TAURI_ERROR' && event.data.id === id) {
          window.removeEventListener('message', listener);
          reject(new Error(event.data.error));
        }
      };
      window.addEventListener('message', listener);
      window.parent.postMessage({
        type: 'TAURI_INVOKE',
        id: id,
        command: command,
        args: args
      }, '*');
    });
  };

  useEffect(() => {
    getResolution();
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    // Registrar clicks en toda la pantalla
    const handleClick = (e: MouseEvent) => {
      // No registrar clicks dentro del modal
      const modal = document.querySelector('[data-modal="coordinates"]');
      if (modal && modal.contains(e.target as Node)) {
        return;
      }

      const clickData: ClickRecord = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };

      setClicks(prev => [...prev, clickData]);
      console.log(`📍 Registered click at (${clickData.x}, ${clickData.y})`);
    };

    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, [isRecording]);

  const getResolution = async () => {
    try {
      const res = await invokeTauri('get_screen_resolution');
      setResolution(res);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const saveCoordinates = () => {
    if (clicks.length === 0) {
      alert('No clicks recorded!');
      return;
    }

    // Usar el último click como la posición del botón
    const lastClick = clicks[clicks.length - 1];
    const data = {
      [resolution]: { x: lastClick.x, y: lastClick.y }
    };

    localStorage.setItem('buttonCoordinateMap', JSON.stringify(data));
    setSaved({ x: lastClick.x, y: lastClick.y });
    alert(`✅ Saved! (${lastClick.x}, ${lastClick.y}) for ${resolution}`);
    setClicks([]);
  };

  const clearClicks = () => {
    setClicks([]);
  };

  return (
    <div data-modal="coordinates" className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm overflow-auto">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl my-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">📍 Click Recorder</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resolution Display */}
        <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/10">
          <p className="text-xs text-zinc-400 mb-1">Resolution:</p>
          <p className="text-2xl font-bold text-purple-300">{resolution || 'Loading...'}</p>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-blue/10 border border-blue-500/30 rounded-lg text-sm">
          <p className="text-zinc-300 font-bold mb-2">How it works:</p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            1. Click "Start Recording"
            <br />
            2. Switch to Minecraft
            <br />
            3. Click the Continue button
            <br />
            4. Return and click "Save"
            <br />
            5. Coordinates saved! ✅
          </p>
        </div>

        {/* Recording Toggle */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-full py-3 rounded-lg font-bold text-lg transition-colors mb-4 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-500 animate-pulse'
              : 'bg-purple-600 hover:bg-purple-500'
          }`}
        >
          {isRecording ? '⏹️ Stop Recording' : '▶️ Start Recording'}
        </button>

        {/* Clicks Display */}
        {clicks.length > 0 && (
          <div className="mb-4 p-4 bg-black/40 rounded-lg border border-white/10 max-h-40 overflow-y-auto">
            <p className="text-sm font-bold text-zinc-300 mb-3">📍 Clicks recorded: {clicks.length}</p>
            <div className="space-y-2">
              {clicks.map((click, idx) => (
                <div key={idx} className="text-xs bg-black/50 p-2 rounded border border-white/5">
                  <p className="text-purple-300 font-mono">
                    #{idx + 1}: ({click.x}, {click.y})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Status */}
        {saved && (
          <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg mb-4">
            <p className="text-green-300 font-bold mb-2">✅ Saved!</p>
            <p className="text-sm text-green-200 font-mono">
              X = {saved.x}
              <br />
              Y = {saved.y}
            </p>
            <p className="text-xs text-green-400 mt-2">
              For resolution: {resolution}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={clearClicks}
            disabled={clicks.length === 0}
            className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 rounded-lg font-bold text-sm transition-colors"
          >
            🗑️ Clear
          </button>
          <button
            onClick={saveCoordinates}
            disabled={clicks.length === 0}
            className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg font-bold text-sm transition-colors"
          >
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
}
