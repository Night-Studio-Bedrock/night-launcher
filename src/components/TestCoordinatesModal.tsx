import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function TestCoordinatesModal({ onClose }: { onClose: () => void }) {
  const [resolution, setResolution] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [x, setX] = useState(960);
  const [y, setY] = useState(540);
  const [saved, setSaved] = useState<string>('');

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

  const captureScreenshot = async () => {
    try {
      const base64 = await invokeTauri('capture_screenshot');
      setScreenshot(`data:image/png;base64,${base64}`);
    } catch (e) {
      alert('Error capturing screenshot: ' + e);
    }
  };

  const clickAt = async () => {
    try {
      await invokeTauri('click_at_coordinates', { x, y });
      alert(`✅ Clicked at (${x}, ${y})`);
    } catch (e) {
      alert('Error: ' + e);
    }
  };

  const saveCoords = () => {
    const data = {
      [resolution]: { x, y }
    };
    localStorage.setItem('buttonCoordinateMap', JSON.stringify(data));
    setSaved(resolution);
    alert(`✅ Saved (${x}, ${y}) for ${resolution}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/80 backdrop-blur-sm overflow-auto">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">📍 Button Coordinates</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resolution Display */}
        <div className="mb-4 p-3 bg-black/40 rounded-lg border border-white/10">
          <p className="text-xs text-zinc-400 mb-1">Resolution:</p>
          <p className="text-2xl font-bold text-purple-300">{resolution || 'Loading...'}</p>
        </div>

        {/* Instructions - Compact */}
        <div className="mb-4 p-3 bg-blue/10 border border-blue-500/30 rounded-lg text-xs">
          <p className="text-zinc-300">
            <strong>Steps:</strong> Screenshot → Adjust X,Y → Test Click → Save ✅
          </p>
        </div>

        {/* Coordinates Input - Side by side */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">X</label>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-bold text-center text-lg"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Y</label>
            <input
              type="number"
              value={y}
              onChange={(e) => setY(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-white font-bold text-center text-lg"
            />
          </div>
        </div>

        {/* Action Buttons - Compact */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={captureScreenshot}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm transition-colors"
          >
            📸 Screenshot
          </button>
          <button
            onClick={clickAt}
            className="flex-1 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-sm transition-colors"
          >
            🖱️ Test
          </button>
          <button
            onClick={saveCoords}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-colors"
          >
            💾 Save
          </button>
        </div>

        {/* Screenshot Preview - Scrollable */}
        {screenshot && (
          <div className="mb-4 border border-white/10 rounded-lg overflow-auto max-h-48">
            <img src={screenshot} alt="screenshot" className="w-full" />
          </div>
        )}

        {/* Saved Status */}
        {saved && (
          <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg text-sm">
            <p className="text-green-300 font-bold">
              ✅ Saved ({saved}): X={x}, Y={y}
            </p>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={() => {
            const data = localStorage.getItem('buttonCoordinateMap');
            if (data) {
              navigator.clipboard.writeText(data);
              alert('📋 Copied!');
            }
          }}
          className="w-full py-2 mt-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold transition-colors"
        >
          📋 Copy Data
        </button>
      </div>
    </div>
  );
}
