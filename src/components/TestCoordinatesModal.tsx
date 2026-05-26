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
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 w-full max-w-xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-400">📍 Button Coordinates</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Resolution Display */}
        <div className="mb-6 p-4 bg-black/40 rounded-lg border border-white/10">
          <p className="text-sm text-zinc-400 mb-2">Current Screen Resolution:</p>
          <p className="text-3xl font-bold text-purple-300">{resolution || 'Loading...'}</p>
        </div>

        {/* Screenshot */}
        <div className="mb-6">
          <button
            onClick={captureScreenshot}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors mb-3"
          >
            📸 Capture Screenshot
          </button>
          {screenshot && (
            <div className="border border-white/10 rounded-lg overflow-hidden max-h-64">
              <img src={screenshot} alt="screenshot" className="w-full" />
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-zinc-300">
            <strong>How to use:</strong>
            <br />
            1. Take a screenshot of the Minecraft dialog
            <br />
            2. Adjust X and Y to point at the Continue button
            <br />
            3. Click the button to test
            <br />
            4. Save when correct ✅
          </p>
        </div>

        {/* Coordinates Input */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">X Position</label>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-lg font-bold text-center"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Y Position</label>
            <input
              type="number"
              value={y}
              onChange={(e) => setY(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white text-lg font-bold text-center"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={clickAt}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
          >
            🖱️ Test Click
          </button>
          <button
            onClick={saveCoords}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
          >
            💾 Save ({resolution})
          </button>
        </div>

        {/* Saved Status */}
        {saved && (
          <div className="p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
            <p className="text-green-300 text-sm font-bold">
              ✅ Saved! X={x}, Y={y} for {saved}
            </p>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={() => {
            const data = localStorage.getItem('buttonCoordinateMap');
            if (data) {
              navigator.clipboard.writeText(data);
              alert('📋 Coordinates copied to clipboard!');
            } else {
              alert('No coordinates saved yet');
            }
          }}
          className="w-full py-2 mt-6 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold transition-colors"
        >
          📋 Copy Saved Data
        </button>
      </div>
    </div>
  );
}
