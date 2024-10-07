import { create } from "zustand";
import { BACKEND_URL } from "@/constants/globals";
import { Message } from "@/types/models";

interface WebSocketStore {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (message: { content: string; recipient_id: number }) => void;
  addMessageListener: (callback: (message: Message) => void) => void;
  removeMessageListener: (callback: (message: Message) => void) => void;
}

const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
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

    set({ socket });
  },
  disconnect: () => {
    get().socket?.close();
    set({ socket: null, isConnected: false });
  },
  sendMessage: (message) => {
    if (get().socket && get().isConnected) {
      get().socket?.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  },
  addMessageListener: (callback) => {
    const messageHandler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      callback(message);
    };
    get().socket?.addEventListener("message", messageHandler);
  },
  removeMessageListener: (callback) => {
    const messageHandler = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      callback(message);
    };
    get().socket?.removeEventListener("message", messageHandler);
  },
}));

export default useWebSocketStore;