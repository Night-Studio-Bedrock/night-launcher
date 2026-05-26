import { useState, useEffect } from 'react';
import { X, Camera, MousePointer } from 'lucide-react';

interface CoordinateMap {
  [key: string]: { x: number; y: number; description: string };
}

export function TestCoordinatesModal({ onClose }: { onClose: () => void }) {
  const [resolution, setResolution] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [coordMap, setCoordMap] = useState<CoordinateMap>({
    '1920x1080': { x: 960, y: 540, description: 'Default 1080p' },
    '1366x768': { x: 683, y: 384, description: 'Default 768p' },
    '1440x900': { x: 720, y: 450, description: 'Default 900p' },
  });

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

  const getResolution = async () => {
    try {
      const res = await invokeTauri('get_screen_resolution');
      setResolution(res);
    } catch (e) {
      console.error('Error getting resolution:', e);
    }
  };

  const setResolution_ = async (w: number, h: number) => {
    try {
      const res = await invokeTauri('set_screen_resolution', { width: w, height: h });
      console.log(res);
      setTimeout(() => getResolution(), 1000);
    } catch (e) {
      console.error('Error setting resolution:', e);
    }
  };

  const captureScreenshot = async () => {
    try {
      const base64 = await invokeTauri('capture_screenshot');
      setScreenshot(`data:image/png;base64,${base64}`);
    } catch (e) {
      console.error('Error capturing screenshot:', e);
    }
  };

  const clickCoords = async () => {
    try {
      await invokeTauri('click_at_coordinates', { x: coords.x, y: coords.y });
      alert(`Clicked at (${coords.x}, ${coords.y})`);
    } catch (e) {
      console.error('Error clicking:', e);
    }
  };

  const saveCoordinates = () => {
    if (!resolution) return;
    
    const newMap = { ...coordMap };
    newMap[resolution] = {
      x: coords.x,
      y: coords.y,
      description: `Mapped at ${resolution}`
    };
    setCoordMap(newMap);
    
    // Guardar en localStorage
    localStorage.setItem('buttonCoordinateMap', JSON.stringify(newMap));
    alert(`Coordinates saved for ${resolution}!`);
  };

  useEffect(() => {
    getResolution();
    
    // Cargar del localStorage
    const saved = localStorage.getItem('buttonCoordinateMap');
    if (saved) {
      setCoordMap(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl text-purple-400">Test Coordinates</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resolution Section */}
        <div className="space-y-3 bg-black/40 p-4 rounded-lg">
          <h3 className="font-bold text-white">Current Resolution:</h3>
          <p className="text-lg font-mono text-purple-300">{resolution}</p>
          <button onClick={getResolution} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors">
            Refresh Resolution
          </button>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { w: 1920, h: 1080, label: '1080p' },
              { w: 1366, h: 768, label: '768p' },
              { w: 1440, h: 900, label: '900p' },
            ].map(({ w, h, label }) => (
              <button
                key={`${w}x${h}`}
                onClick={() => setResolution_(w, h)}
                className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs font-bold transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot Section */}
        <div className="space-y-3 bg-black/40 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">Screenshot</h3>
          </div>
          <button onClick={captureScreenshot} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold transition-colors">
            Capture Screenshot
          </button>
          
          {screenshot && (
            <div className="border border-white/10 rounded-lg overflow-hidden max-h-80">
              <img src={screenshot} alt="screenshot" className="w-full" />
            </div>
          )}
        </div>

        {/* Coordinates Section */}
        <div className="space-y-3 bg-black/40 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <MousePointer className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">Button Coordinates</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-400">X Coordinate</label>
              <input
                type="number"
                value={coords.x}
                onChange={(e) => setCoords({ ...coords, x: parseInt(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Y Coordinate</label>
              <input
                type="number"
                value={coords.y}
                onChange={(e) => setCoords({ ...coords, y: parseInt(e.target.value) })}
                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={clickCoords} className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-bold transition-colors">
              Click Here
            </button>
            <button onClick={saveCoordinates} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors">
              Save for {resolution}
            </button>
          </div>
        </div>

        {/* Saved Coordinates */}
        <div className="space-y-3 bg-black/40 p-4 rounded-lg">
          <h3 className="font-bold text-white">Saved Button Coordinates:</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(coordMap).map(([res, data]) => (
              <div key={res} className="bg-black/50 p-2 rounded border border-white/5">
                <p className="font-mono text-sm text-purple-300">{res}</p>
                <p className="text-xs text-zinc-400">({data.x}, {data.y}) - {data.description}</p>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => {
              const json = JSON.stringify(coordMap, null, 2);
              console.log('Coordinate Map:', json);
              navigator.clipboard.writeText(json);
              alert('Coordinates copied to clipboard!');
            }}
            className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
