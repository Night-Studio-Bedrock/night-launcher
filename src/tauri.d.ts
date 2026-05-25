// Tipos globales para Tauri
declare global {
  interface Window {
    __TAURI__: {
      core: {
        invoke: (cmd: string, args?: Record<string, any>) => Promise<any>;
      };
      event: {
        listen: (event: string, handler: (event: any) => void) => Promise<() => void>;
        emit: (event: string, payload?: any) => Promise<void>;
        emitTo: (target: string, event: string, payload?: any) => Promise<void>;
      };
    };
  }
}

export {};
