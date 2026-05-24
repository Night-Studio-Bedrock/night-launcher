import { Settings } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  bgVolume: number;
  setBgVolume: (val: number) => void;
  shouldInject: boolean;
  onInjectChange: (checked: boolean) => void;
}

export const SettingsModal = ({ 
  onClose, 
  bgVolume, 
  setBgVolume, 
  shouldInject, 
  onInjectChange 
}: SettingsModalProps) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-zinc-400" />
            Launcher Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-black/50 p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-sm">Background Volume ({bgVolume}%)</span>
              <input 
              type="range" 
              min="0" 
              max="100" 
              value={bgVolume}
              onChange={(e) => setBgVolume(Number(e.target.value))}
              className="w-32 cursor-pointer" 
              />
          </div>

          <label className="flex items-center gap-3 text-sm bg-black/50 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-black/70 transition-colors">
              <input 
                type="checkbox" 
                checked={shouldInject} 
                onChange={(e) => onInjectChange(e.target.checked)}
                className="cursor-pointer"
              />
              <span>Auto-inject global resources</span>
          </label>
        </div>
        
        <div className="flex justify-end pt-2">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors cursor-pointer text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
