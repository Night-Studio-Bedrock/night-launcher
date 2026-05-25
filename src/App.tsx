import { useState, useRef, useEffect } from 'react';
import { Settings, Rocket, User } from 'lucide-react';
import { Howl } from 'howler';
import { useServerStatus } from './hooks/useServerStatus';

import { SocialBar } from './components/SocialBar';
import { ServerStatusBox } from './components/ServerStatusBox';
import { SettingsModal } from './components/SettingsModal';
import { ProfileCard } from './components/ProfileCard';
import './App.css';

function App() {
  // ==========================================
  // STATES WITH LOCALSTORAGE (Persistence)
  // ==========================================
  const [shouldInject, setShouldInject] = useState(() => {
    const saved = localStorage.getItem('nightLauncher_shouldInject');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [bgVolume, setBgVolume] = useState(() => {
    const saved = localStorage.getItem('nightLauncher_bgVolume');
    return saved !== null ? parseInt(saved, 10) : 15;
  });

  const [gamertag, setGamertag] = useState(() => {
    return localStorage.getItem('nightLauncher_gamertag') || '';
  });

  useEffect(() => { localStorage.setItem('nightLauncher_shouldInject', JSON.stringify(shouldInject)); }, [shouldInject]);
  useEffect(() => { localStorage.setItem('nightLauncher_bgVolume', bgVolume.toString()); }, [bgVolume]);
  useEffect(() => { localStorage.setItem('nightLauncher_gamertag', gamertag); }, [gamertag]);

  // ==========================================
  // INTERFACE STATES
  // ==========================================
  const [isLaunching, setIsLaunching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [gamertagInput, setGamertagInput] = useState(gamertag);
  
  const musicRef = useRef<Howl | null>(null);
  const volumeRef = useRef(bgVolume);

  const [serverAddress, setServerAddress] = useState('play.hypixel.net:25565');
  const serverData = useServerStatus(serverAddress);
  
  const [bgUrl, setBgUrl] = useState('');
  const [isVideoBg, setIsVideoBg] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1);
  
  const [titleImg, setTitleImg] = useState('');
  const [logoImg, setLogoImg] = useState('');
  const [musicTracks, setMusicTracks] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState<Record<string, string>>({});
  
  const [themeColor, setThemeColor] = useState('#a855f7'); 
  const [windowTitle, setWindowTitle] = useState('');

  const [isSyncing, setIsSyncing] = useState(true);
  const [syncMsg, setSyncMsg] = useState("Downloading Night Assets...");
  const [syncProgress, setSyncProgress] = useState(0);
  
  const CONFIG_URL = "https://halo333x.github.io/bedrock-launcher/data.json";

  // ==========================================
  // MUSIC EFFECT
  // ==========================================
  useEffect(() => {
    if (musicTracks.length === 0) return;
    const playRandomTrack = (currentIndex?: number) => {
      let nextIndex = Math.floor(Math.random() * musicTracks.length);
      if (musicTracks.length > 1 && nextIndex === currentIndex) nextIndex = (nextIndex + 1) % musicTracks.length;
      if (musicRef.current) musicRef.current.unload();
      musicRef.current = new Howl({
        src: [musicTracks[nextIndex]],
        html5: true, autoplay: true, volume: volumeRef.current / 100,
        onend: () => playRandomTrack(nextIndex)
      });
    };
    playRandomTrack();
    return () => { musicRef.current?.unload(); };
  }, [musicTracks]);

  useEffect(() => {
    volumeRef.current = bgVolume;
    musicRef.current?.volume(bgVolume / 100);
  }, [bgVolume]);

  // ==========================================
  // INITIALIZE LAUNCHER
  // ==========================================
  useEffect(() => {
    const initLauncher = async () => {
      try {
        setSyncProgress(20);
        const res = await fetch(`${CONFIG_URL}?nocache=${new Date().getTime()}`);
        if (!res.ok) throw new Error("Failed to fetch configuration");
        setSyncProgress(50);
        const config = await res.json();

        const baseUrl = config.url || "https://night-studio-bedrock.github.io/night-launcher-data/";
        if (config.launch_button_color) setThemeColor(config.launch_button_color);
        if (config.window?.name) setWindowTitle(config.window.name);
        if (config.background_opacity !== undefined) setBgOpacity(config.background_opacity);

        if (config.data) {
          const { icons, music, server, social_media } = config.data;
          if (icons) {
            if (icons.background) {
              const bgName = icons.background.toLowerCase();
              setIsVideoBg(bgName.endsWith('.mp4') || bgName.endsWith('.mov'));
              setBgUrl(`${baseUrl}icons/${icons.background}`);
            }
            const titleName = icons.title || icons.tite; 
            if (titleName) setTitleImg(`${baseUrl}icons/${titleName}`);
            if (icons.logo) setLogoImg(`${baseUrl}icons/${icons.logo}`);
          }
          if (music) setMusicTracks(music.map((m: string) => `${baseUrl}music/${m}`));
          if (server) setServerAddress(`${server.ip}:${server.port}`);
          if (social_media) setSocialMedia(social_media);
        }
        setSyncProgress(100);
        setTimeout(() => setIsSyncing(false), 800);
      } catch (error) {
        console.error(error);
        setSyncMsg("Offline mode");
        setTimeout(() => setIsSyncing(false), 1500);
      } 
    };

    initLauncher();
  }, []);

  const handleLaunchClick = async () => {
    setIsLaunching(true);
    try {
      // Verificar si está en Tauri
      if (!window.__TAURI__) {
        console.warn('Not in Tauri environment');
        setIsLaunching(false);
        return;
      }

      const { invoke } = window.__TAURI__.core;

      console.log('=== LAUNCH BUTTON CLICKED FROM VERCEL ===');

      // Cargar config del repositorio
      const configUrl = `https://halo333x.github.io/bedrock-launcher/data.json?nocache=${new Date().getTime()}`;
      console.log('Fetching config from:', configUrl);

      const configResponse = await fetch(configUrl);
      if (!configResponse.ok) throw new Error('Failed to fetch config');
      const config = await configResponse.json();

      console.log('Config loaded:', config);

      const { ip, port } = config.data.server;
      const serverUrl = `minecraft://connect?serverUrl=${ip}&serverPort=${port}`;

      console.log('Server URL:', serverUrl);
      console.log('Invoking Tauri launch_minecraft_with_url');

      // Invocar comando Rust
      const result = await invoke('launch_minecraft_with_url', { url: serverUrl });

      console.log('Tauri result:', result);
      console.log('=== LAUNCH SUCCESSFUL ===');

      // Esperar un poco para que se vea la animación
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.error("Launch error:", e);
    } finally {
      setTimeout(() => setIsLaunching(false), 1000);
    }
  };

  return (
    <div 
      className="relative w-screen h-[100dvh] overflow-hidden bg-zinc-950 text-white font-sans selection:bg-purple-500 select-none"
      style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
      {/* DYNAMIC BACKGROUND */}
      <div className="absolute inset-0 bg-black">
        {isVideoBg && bgUrl ? (
          <video key={bgUrl} autoPlay loop muted playsInline src={bgUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-105" style={{ opacity: bgOpacity }} />
        ) : (
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105" style={{ backgroundImage: bgUrl ? `url('${bgUrl}')` : 'none', opacity: bgOpacity }} />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-96 flex flex-col gap-4 shadow-2xl">
            <h2 className="font-bold text-xl flex items-center gap-2"><User className="w-5 h-5 text-purple-400"/> Xbox Profile</h2>
            <p className="text-sm text-zinc-400">Enter your Gamertag to personalize your launcher experience.</p>
            <input
              type="text"
              value={gamertagInput}
              onChange={e => setGamertagInput(e.target.value)}
              placeholder="Ex: SteveMaster99"
              className="bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors"
            />
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm">Cancel</button>
              <button onClick={() => {
                setGamertag(gamertagInput);
                setShowProfileModal(false);
              }} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">Save Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR - PROFILE ALWAYS VISIBLE */}
      <ProfileCard 
        gamertag={gamertag} 
        onEditClick={() => setShowProfileModal(true)} 
      />

      {/* MAIN CONTENT */}
      <main className="relative z-20 w-full h-full flex flex-col p-6 md:p-10 pointer-events-none">
        
        {/* TOP LOGO */}
        <div className="w-full flex justify-end h-16 md:h-20 items-start flex-shrink-0">
          {logoImg && <img src={logoImg} alt="Logo" draggable={false} className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] pointer-events-auto"/>}
        </div>

        {/* CENTRAL ZONE */}
        <div className="flex-1 flex flex-col items-center justify-start md:pt-4 gap-4 md:gap-6 min-h-0">
          {titleImg ? (
            <img src={titleImg} alt="Title" draggable={false} className="launcher-title max-h-[20vh] md:max-h-[30vh] object-contain pointer-events-auto" />
          ) : (
            <h1 className="text-4xl md:text-6xl font-black italic text-zinc-100 drop-shadow-2xl">{windowTitle || 'NIGHT LAUNCHER'}</h1>
          )}
          
          <button 
            onClick={handleLaunchClick} 
            disabled={isLaunching || isSyncing}
            className={`rocket-button group pointer-events-auto ${isLaunching ? 'launch-state' : isSyncing ? 'sync-state' : ''}`}
          >
            <Rocket className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-500 ${isLaunching ? 'rotate-45 text-green-500' : isSyncing ? 'animate-pulse text-zinc-500' : 'group-hover:-rotate-12 group-hover:-translate-y-1'}`} style={{ color: (!isLaunching && !isSyncing) ? themeColor : undefined }} />
            <span className={`text-lg md:text-xl font-bold tracking-widest ${isLaunching ? 'animate-pulse text-green-500' : isSyncing ? 'text-zinc-500' : ''}`} style={{ color: (!isLaunching && !isSyncing) ? themeColor : undefined }}>
              {isLaunching ? 'LAUNCHING...' : isSyncing ? 'WAIT...' : 'LAUNCH'}
            </span>
          </button>

          {/* DOWNLOAD CARD */}
          <div className={`mt-2 bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 flex items-center gap-4 md:gap-5 w-[90%] max-w-[450px] backdrop-blur-md transition-all duration-500 transform pointer-events-auto ${isSyncing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white tracking-wide truncate">{windowTitle || 'Night Launcher'}</h3>
              <p className="text-[10px] md:text-xs text-zinc-400 mt-1 truncate">{syncMsg}</p>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-3 md:mt-4 overflow-hidden">
                <div className="h-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${syncProgress}%`, backgroundColor: themeColor }} />
              </div>
            </div>
            {logoImg && <img src={logoImg} alt="Thumb" className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-black/50 p-1.5 shadow-inner object-contain flex-shrink-0" />}
          </div>
        </div>

        {/* BOTTOM CONTAINER */}
        <div className="w-full flex items-end justify-between pointer-events-auto flex-shrink-0 mt-auto pt-4">
          {/* Left space (1/3) */}
          <div className="w-1/3 hidden md:block"></div>

          {/* Social centered (1/3) */}
          <div className="w-1/3 flex justify-center">
            <SocialBar socialMedia={socialMedia} />
          </div>

          {/* Status and Settings right (1/3) */}
          <div className="w-1/3 flex justify-end items-center gap-2 md:gap-4">
            <div className="hidden md:block">
              <ServerStatusBox {...serverData} />
            </div>
            <button onClick={() => setShowSettings(true)} className="p-3 bg-black/40 rounded-xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer">
              <Settings className="w-5 h-5 text-zinc-300" />
            </button>
          </div>
        </div>
      </main>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal 
          onClose={() => setShowSettings(false)}
          bgVolume={bgVolume}
          setBgVolume={setBgVolume}
          shouldInject={shouldInject}
          onInjectChange={setShouldInject}
        />
      )}
    </div>
  );
}

export default App;
