interface BotpressWebChat {
    init: (config: {
      botId: string;
      host: string;
      clientId: string;
      userId?: string;
      userData?: Record<string, any>;
      composerPlaceholder?: string;
      showPoweredBy?: boolean;
    }) => void;
    sendEvent: (event: { type: string }) => void;
    onEvent: (callback: (event: any) => void, events: string[]) => void;
    offEvent: (events: string[]) => void;
  }
  
  interface Window {
    botpressWebChat: BotpressWebChat;
  }