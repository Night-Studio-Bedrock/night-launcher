import { Activity } from 'lucide-react';

interface ServerStatusBoxProps {
  loading: boolean;
  online: boolean;
  players: number;
  max: number;
  version: string;
}

export const ServerStatusBox = ({ loading, online, players, max, version }: ServerStatusBoxProps) => {
  return (
    <div className="justify-self-start">
      {/* Aquí aplicamos exactamente las mismas clases que el botón de ajustes */}
      <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-4 backdrop-blur-md">
        {loading ? (
          <Activity className="animate-pulse w-5 h-5 text-zinc-400" />
        ) : online ? (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_#22c55e]" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-green-400 leading-none">ONLINE</span>
              <span className="text-xs text-zinc-300 mt-1">
                Players: <span className="text-white">{players} / {max}</span>
              </span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="flex flex-col justify-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                Version
              </span>
              <span className="text-sm text-white font-mono leading-none mt-1">
                {version || 'Unknown'}
              </span>
            </div>
          </>
        ) : (
          <span className="text-red-500 font-bold px-2">OFFLINE</span>
        )}
      </div>
    </div>
  );
};