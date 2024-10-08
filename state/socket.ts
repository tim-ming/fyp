import { create } from "zustand";
import { BACKEND_URL } from "@/constants/globals";
import { Message } from "@/types/models";

interface WebSocketStore {
  socket: WebSocket | null;
  isConnected: boolean;
  messageHandlers: Map<number, (message: Message) => void>;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (message: { content: string; recipient_id: number }) => void;
  addMessageListener: (recipientId: number, callback: (message: Message) => void) => void;
  removeMessageListener: (recipientId: number) => void;
}

const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  messageHandlers: new Map(),
  connect: (token: string) => {
    if (get().socket) {
      get().socket?.close();
    }

    const url = BACKEND_URL.replace(/^https/, "wss").replace(/^http/, "ws");
    const socket = new WebSocket(`${url}/ws/chat?token=${token}`);

    socket.onopen = () => {
      console.log("WebSocket Connected");
      set({ isConnected: true });
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
      set({ isConnected: false });
      // Attempt to reconnect after a delay
      setTimeout(() => get().connect(token), 5000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onmessage = (event: MessageEvent) => {
      const message: Message = JSON.parse(event.data);
      console.log(get().messageHandlers);
      const handler = get().messageHandlers.get(message.recipient_id);
      if (handler) {
        handler(message);
      }
      const otherHandler = get().messageHandlers.get(message.sender_id);
      if (otherHandler) {
        otherHandler(message);
      }
      const therapistHandler = get().messageHandlers.get(-1);
      if (therapistHandler) {
        therapistHandler(message);
      }
    };

    set({ socket });
  },
  disconnect: () => {
    get().socket?.close();
    set({ socket: null, isConnected: false, messageHandlers: new Map() });
  },
  sendMessage: (message) => {
    if (get().socket && get().isConnected) {
      get().socket?.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  },
  addMessageListener: (recipientId, callback) => {
    set((state) => {
      const newHandlers = new Map(state.messageHandlers);
      newHandlers.set(recipientId, callback);
      return { messageHandlers: newHandlers };
    });
  },
  removeMessageListener: (recipientId) => {
    set((state) => {
      const newHandlers = new Map(state.messageHandlers);
      newHandlers.delete(recipientId);
      return { messageHandlers: newHandlers };
    });
  },
}));

export default useWebSocketStore;