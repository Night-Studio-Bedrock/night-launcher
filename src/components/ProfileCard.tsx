interface ProfileCardProps {
  gamertag: string;
  onEditClick: () => void;
}

export const ProfileCard = ({ gamertag, onEditClick }: ProfileCardProps) => {
  return (
    <div className="pointer-events-auto">
      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-white/10 px-2.5 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shadow-lg hover:bg-black/60 transition-all cursor-pointer" onClick={onEditClick}>
        <img 
          src={gamertag ? `https://mc-api.io/render/face/${gamertag}/bedrock` : `https://mc-api.io/render/face/steve/bedrock`} 
          alt="Avatar" 
          className="w-8 sm:w-10 h-8 sm:h-10 rounded-md bg-black/50 flex-shrink-0"
          onError={(e) => { e.currentTarget.src = 'https://mc-api.io/render/face/steve/bedrock'; }}
        />
        <div className="flex flex-col hidden sm:flex min-w-0">
          <span className="text-xs sm:text-sm font-bold text-white leading-none truncate">{gamertag || 'Sign In'}</span>
          <span className="text-[7px] sm:text-[8px] text-green-400 font-mono mt-0.5">ONLINE</span>
        </div>
      </div>
    </div>
  );
};
