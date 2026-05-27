import { useState, useRef, useEffect } from "react";
import { Rocket } from "lucide-react";
import { useServerStatus } from "./hooks/useServerStatus";
import "./App.css";

function App() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncMsg, setSyncMsg] = useState("Downloading Night Assets...");
  const [syncProgress, setSyncProgress] = useState(0);

  const [bgUrl, setBgUrl] = useState("");
  const [isVideoBg, setIsVideoBg] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [titleImg, setTitleImg] = useState("");
  const [logoImg, setLogoImg] = useState("");
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [windowTitle, setWindowTitle] = useState("");

  const CONFIG_URL =
    "https://night-studio-bedrock.github.io/night-launcher-data/data.json";

  // ==========================================
  // DETECT IF ANDROID
  // ==========================================
  const isAndroid = /Android/i.test(navigator.userAgent);

  // ==========================================
  // INITIALIZE LAUNCHER
  // ==========================================
  useEffect(() => {
    const initLauncher = async () => {
      try {
        setSyncProgress(20);
        const res = await fetch(
          `${CONFIG_URL}?nocache=${new Date().getTime()}`,
        );
        if (!res.ok) throw new Error("Failed to fetch configuration");
        setSyncProgress(50);
        const config = await res.json();

        const baseUrl =
          config.url ||
          "https://night-studio-bedrock.github.io/night-launcher-data/";
        if (config.launch_button_color)
          setThemeColor(config.launch_button_color);
        if (config.window?.name) setWindowTitle(config.window.name);
        if (config.background_opacity !== undefined)
          setBgOpacity(config.background_opacity);

        if (config.data) {
          const { icons } = config.data;
          if (icons) {
            if (icons.background) {
              const bgName = icons.background.toLowerCase();
              setIsVideoBg(bgName.endsWith(".mp4") || bgName.endsWith(".mov"));
              setBgUrl(
                `${baseUrl}icons/${icons.background}?nocache=${new Date().getTime()}`,
              );
            }
            const titleName = icons.title || icons.tite;
            if (titleName)
              setTitleImg(
                `${baseUrl}icons/${titleName}?nocache=${new Date().getTime()}`,
              );
            if (icons.logo)
              setLogoImg(
                `${baseUrl}icons/${icons.logo}?nocache=${new Date().getTime()}`,
              );
          }
        }
        setSyncProgress(100);
        setIsSyncing(false);
      } catch (error) {
        setSyncMsg("Ready!");
        setSyncProgress(100);
        setIsSyncing(false);
      }
    };

    initLauncher();
  }, []);

  const handleLaunchClick = async () => {
    setIsLaunching(true);
    try {
      const configUrl = `https://night-studio-bedrock.github.io/night-launcher-data/data.json?nocache=${new Date().getTime()}`;

      const configResponse = await fetch(configUrl);
      if (!configResponse.ok) throw new Error("Failed to fetch config");
      const config = await configResponse.json();

      const { ip, port } = config.data.server;
      const minecraftUri = `minecraft://connect?serverUrl=${ip}&serverPort=${port}`;
      
      const intent = Intent(Intent.ACTION_VIEW, Uri.parse(minecraftUri));
      intent.setAction(Intent.ACTION_VIEW);
      intent.setData(Uri.parse(minecraftUri));
      
      // Abrir con Minecraft
      window.location.href = minecraftUri;

      setIsLaunching(false);
    } catch (e) {
      setIsLaunching(false);
    }
  };

  const isButtonDisabled = isLaunching || isSyncing;

  return (
    <div
      className="overflow-hidden bg-zinc-950 text-white font-sans selection:bg-purple-500 select-none"
      style={
        {
          "--theme-color": themeColor,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          padding: 0,
          margin: 0,
        } as React.CSSProperties
      }
    >
      {/* DYNAMIC BACKGROUND */}
      <div className="absolute inset-0 bg-black">
        {isVideoBg && bgUrl ? (
          <video
            key={bgUrl}
            autoPlay
            loop
            muted
            playsInline
            src={bgUrl}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-105"
            style={{ opacity: bgOpacity }}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-105"
            style={{
              backgroundImage: bgUrl ? `url('${bgUrl}')` : "none",
              opacity: bgOpacity,
            }}
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
      </div>

      {/* MAIN CONTENT */}
      <main
        className="relative z-20 flex flex-col items-center justify-center pointer-events-none"
        style={{ width: "100vw", height: "100vh", padding: 0, margin: 0 }}
      >
        {/* TOP LOGO */}
        <div className="absolute top-4 right-4 z-30 pointer-events-auto">
          {logoImg && (
            <img
              src={logoImg}
              alt="Logo"
              draggable={false}
              className="w-16 h-16 object-contain transition-transform hover:scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            />
          )}
        </div>

        {/* CENTRAL CONTENT */}
        <div className="flex flex-col items-center gap-6 z-20">
          {titleImg ? (
            <img
              src={titleImg}
              alt="Title"
              draggable={false}
              className="launcher-title object-contain max-h-[35vh] pointer-events-auto"
            />
          ) : (
            <h1 className="font-black italic text-zinc-100 drop-shadow-2xl text-4xl md:text-6xl">
              {windowTitle || "NIGHT LAUNCHER"}
            </h1>
          )}

          <button
            onClick={handleLaunchClick}
            disabled={isButtonDisabled}
            className={`rocket-button group pointer-events-auto origin-center cursor-pointer scale-100 ${isLaunching ? "launch-state" : isSyncing ? "sync-state" : ""} ${isButtonDisabled ? "opacity-50" : "opacity-100"}`}
          >
            <Rocket
              className={`w-6 h-6 transition-transform duration-500 ${isLaunching ? "rotate-45 text-green-500" : isSyncing ? "animate-pulse text-zinc-500" : "group-hover:-rotate-12 group-hover:-translate-y-1"}`}
              style={{
                color:
                  !isButtonDisabled && !isLaunching && !isSyncing
                    ? themeColor
                    : undefined,
              }}
            />
            <span
              className={`font-bold tracking-widest text-lg md:text-xl ${isLaunching ? "animate-pulse text-green-500" : isSyncing ? "text-zinc-500" : ""}`}
              style={{
                color:
                  !isButtonDisabled && !isLaunching && !isSyncing
                    ? themeColor
                    : undefined,
              }}
            >
              {isLaunching ? "LAUNCHING..." : isSyncing ? "WAIT..." : "LAUNCH"}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
