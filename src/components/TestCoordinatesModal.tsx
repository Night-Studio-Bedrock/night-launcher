import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function TestCoordinatesModal({ onClose }: { onClose: () => void }) {
  const [resolution, setResolution] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [clicks, setClicks] = useState<Array<{x: number; y: number}>>([]);
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

  const getResolution = async () => {
    try {
      const res = await invokeTauri('get_screen_resolution');
      setResolution(res);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  const startRecording = async () => {
    try {
      await invokeTauri('start_click_recording');
      setIsRecording(true);
      setClicks([]);
      setSaved(null);
    } catch (e) {
      alert('Error starting recording: ' + e);
    }
  };

  const stopRecording = async () => {
    try {
      await invokeTauri('stop_click_recording');
      setIsRecording(false);
      
      // Obtener clicks registrados
      const clicksJson = await invokeTauri('get_recorded_clicks');
      const clicksList = JSON.parse(clicksJson);
      setClicks(clicksList);
    } catch (e) {
      alert('Error stopping recording: ' + e);
    }
  };

  const saveCoordinates = () => {
    if (clicks.length === 0) {
      alert('No clicks recorded!');
      return;
    }

    const lastClick = clicks[clicks.length - 1];
    const data = {
      [resolution]: { x: lastClick.x, y: lastClick.y }
    };

    localStorage.setItem('buttonCoordinateMap', JSON.stringify(data));
    setSaved({ x: lastClick.x, y: lastClick.y });
    alert(`✅ Saved (${lastClick.x}, ${lastClick.y}) for ${resolution}`);
  };

  return (
    <div data-modal="coordinates" className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">📍 Click Recorder (Rust)</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resolution */}
        <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/10">
          <p className="text-xs text-zinc-400">Resolution:</p>
          <p className="text-2xl font-bold text-purple-300">{resolution || '...'}</p>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg text-xs text-zinc-300">
          <p>
            <strong>Steps:</strong>
            <br />
            1. Click "Start Recording"
            <br />
            2. Click the Continue button in Minecraft
            <br />
            3. Click "Stop Recording"
            <br />
            4. Coordinates appear below
            <br />
            5. Click "Save" ✅
          </p>
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg animate-pulse">
            <p className="text-red-300 font-bold text-sm">🔴 RECORDING - Click anywhere</p>
          </div>
        )}

        {/* Recording Toggle */}
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-full py-3 rounded-lg font-bold text-lg transition-colors mb-4 bg-purple-600 hover:bg-purple-500"
          >
            ▶️ Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full py-3 rounded-lg font-bold text-lg transition-colors mb-4 bg-red-600 hover:bg-red-500 animate-pulse"
          >
            ⏹️ Stop Recording
          </button>
        )}

        {/* Clicks Display */}
        {clicks.length > 0 && (
          <div className="mb-4 p-4 bg-black/40 rounded-lg border border-white/10 max-h-40 overflow-y-auto">
            <p className="text-sm font-bold text-zinc-300 mb-3">📍 Clicks: {clicks.length}</p>
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
          <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg mb-4">
            <p className="text-green-300 text-xs font-bold">
              ✅ Saved: ({saved.x}, {saved.y}) for {resolution}
            </p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={saveCoordinates}
          disabled={clicks.length === 0}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-bold text-sm transition-colors"
        >
          💾 Save Last Click
        </button>
      </div>
    </div>
  );
}
