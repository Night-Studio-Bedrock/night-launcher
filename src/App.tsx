import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";
import "./App.css";

function App() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  const [bgUrl, setBgUrl] = useState("");
  const [isVideoBg, setIsVideoBg] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [titleImg, setTitleImg] = useState("");
  const [themeColor, setThemeColor] = useState("#a855f7");
  const [windowTitle, setWindowTitle] = useState("");

  const CONFIG_URL =
    "https://night-studio-bedrock.github.io/night-launcher-data/data.json";

  useEffect(() => {
    const initLauncher = async () => {
      try {
        const res = await fetch(
          `${CONFIG_URL}?nocache=${new Date().getTime()}`,
        );
        if (!res.ok) throw new Error("Failed to fetch configuration");
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
          }
        }
        setIsSyncing(false);
      } catch (error) {
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
      
      window.location.href = minecraftUri;

      setIsLaunching(false);
    } catch (e) {
      setIsLaunching(false);
    }
  };

  const isButtonDisabled = isLaunching || isSyncing;

  return (
    <div
      style={{
        "--theme-color": themeColor,
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        width: "100%",
        height: "100%",
        padding: "0",
        margin: "0",
        overflow: "hidden",
        backgroundColor: "#000000",
        boxSizing: "border-box",
      } as React.CSSProperties}
    >
      {/* BACKGROUND */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          backgroundColor: "#000000",
          boxSizing: "border-box",
        }}
      >
        {isVideoBg && bgUrl ? (
          <video
            key={bgUrl}
            autoPlay
            loop
            muted
            playsInline
            src={bgUrl}
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: bgOpacity,
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              backgroundImage: bgUrl ? `url('${bgUrl}')` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: bgOpacity,
              display: "block",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "rgba(0,0,0,0.2)",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "192px",
            background:
              "linear-gradient(to top, #18181b, rgba(24,24,27,0.37), transparent)",
            display: "block",
          }}
        />
      </div>

      {/* CONTENT */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: "20",
          boxSizing: "border-box",
        }}
      >
        {/* TITLE */}
        <div style={{ marginBottom: "32px" }}>
          {titleImg ? (
            <img
              src={titleImg}
              alt="Title"
              draggable={false}
              style={{
                objectFit: "contain",
                maxHeight: "35vh",
                filter: "drop-shadow(0 10px 30px rgba(0, 0, 0, 0.8))",
                display: "block",
              }}
            />
          ) : (
            <h1
              style={{
                fontWeight: 900,
                fontStyle: "italic",
                color: "#e4e4e7",
                textShadow: "0 0 30px rgba(0,0,0,0.8)",
                fontSize: "clamp(2rem, 8vw, 4rem)",
                margin: "0",
                padding: "0",
                display: "block",
              }}
            >
              {windowTitle || "NIGHT LAUNCHER"}
            </h1>
          )}
        </div>

        {/* LAUNCH BUTTON */}
        <button
          onClick={handleLaunchClick}
          disabled={isButtonDisabled}
          className="rocket-button"
          style={{
            opacity: isButtonDisabled ? 0.5 : 1,
            cursor: isButtonDisabled ? "wait" : "pointer",
          }}
        >
          <Rocket
            style={{
              width: "24px",
              height: "24px",
              color: !isButtonDisabled ? themeColor : "currentColor",
            }}
          />
          <span
            style={{
              fontWeight: "bold",
              letterSpacing: "0.1em",
              color: !isButtonDisabled ? themeColor : "currentColor",
            }}
          >
            {isLaunching ? "LAUNCHING..." : isSyncing ? "WAIT..." : "LAUNCH"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default App;
