interface ProfileCardProps {
  gamertag: string;
  onEditClick: () => void;
}

export const ProfileCard = ({ gamertag, onEditClick }: ProfileCardProps) => {
  return (
    <div className="fixed bottom-6 md:bottom-10 left-6 z-40 pointer-events-auto">
      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-white/10 px-4 py-3 flex items-center gap-3 shadow-lg hover:bg-black/60 transition-all cursor-pointer" onClick={onEditClick}>
        <img 
          src={gamertag ? `https://mc-heads.net/avatar/${gamertag}` : `https://mc-heads.net/avatar/steve`} 
          alt="Avatar" 
          className="w-10 h-10 rounded-md bg-black/50"
          onError={(e) => { e.currentTarget.src = 'https://mc-heads.net/avatar/steve'; }}
        />
        <div className="flex flex-col hidden md:flex">
          <span className="text-sm font-bold text-white leading-none">{gamertag || 'Sign In'}</span>
          <span className="text-[8px] text-green-400 font-mono mt-1">ONLINE</span>
        </div>
      </div>
    </div>
  );
};
