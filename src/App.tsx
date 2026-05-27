        {/* CENTRAL ZONE - ADJUSTED FOR ANDROID */}
        <div className={`flex-1 flex flex-col items-center ${isAndroid ? "justify-start gap-1" : "justify-start md:pt-4 gap-4 md:gap-6"} min-h-0`}>
          {titleImg ? (
            <img
              src={titleImg}
              alt="Title"
              draggable={false}
              className={`launcher-title object-contain pointer-events-auto ${isAndroid ? "max-h-[20vh]" : "max-h-[35vh]"}`}
            />
          ) : (
            <h1 className={`font-black italic text-zinc-100 drop-shadow-2xl ${isAndroid ? "text-2xl" : "text-4xl md:text-6xl"}`}>
              {windowTitle || "NIGHT LAUNCHER"}
            </h1>
          )}

          <button
            onClick={handleLaunchClick}
            disabled={isButtonDisabled}
            className={`rocket-button group pointer-events-auto origin-center cursor-pointer ${isAndroid ? "scale-65" : "scale-100"} ${isLaunching ? "launch-state" : isSyncing ? "sync-state" : ""} ${isButtonDisabled ? "opacity-50" : "opacity-100"}`}
          >
            <Rocket
              className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-500 ${isLaunching ? "rotate-45 text-green-500" : isSyncing ? "animate-pulse text-zinc-500" : "group-hover:-rotate-12 group-hover:-translate-y-1"}`}
              style={{
                color:
                  !isButtonDisabled && !isLaunching && !isSyncing
                    ? themeColor
                    : undefined,
              }}
            />
            <span
              className={`font-bold tracking-widest ${isAndroid ? "text-base" : "text-lg md:text-xl"} ${isLaunching ? "animate-pulse text-green-500" : isSyncing ? "text-zinc-500" : ""}`}
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

          {/* DOWNLOAD CARD - MORE VISIBLE ON ANDROID */}
          <div
            className={`bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md transition-all duration-500 transform pointer-events-auto flex items-center gap-4 md:gap-5 w-[95%] ${isAndroid ? "mt-2 p-3 max-w-[500px]" : "mt-2 p-4 md:p-5 max-w-[450px]"} ${isSyncing || isInjecting || isLaunching ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
          >
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-white tracking-wide truncate ${isAndroid ? "text-xs" : "text-sm"}`}>
                {windowTitle || "Night Launcher"}
              </h3>
              <p className={`text-zinc-400 mt-1 truncate ${isAndroid ? "text-[9px]" : "text-[10px] md:text-xs"}`}>
                {isInjecting
                  ? `${injectMsg} ${estimatedTimeLeft ? `- ${estimatedTimeLeft}` : ""}`
                  : isSyncing
                    ? syncMsg
                    : "Launching..."}
              </p>
              <div className={`bg-white/10 rounded-full overflow-hidden ${isAndroid ? "h-1 mt-2" : "h-1.5 mt-3 md:mt-4"}`}>
                <div
                  className="bg-purple-500 transition-all duration-500 ease-out"
                  style={{
                    width: `${isInjecting ? injectProgress : isSyncing ? syncProgress : 100}%`,
                    backgroundColor: themeColor,
                  }}
                />
              </div>
            </div>
            {logoImg && (
              <img
                src={logoImg}
                alt="Thumb"
                className={`rounded-xl bg-black/50 p-1.5 shadow-inner object-contain flex-shrink-0 ${isAndroid ? "w-10 h-10" : "w-12 h-12 md:w-16 md:h-16"}`}
              />
            )}
          </div>
        </div>
