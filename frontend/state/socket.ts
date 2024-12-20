// Socket State
import { create } from "zustand";
import { BACKEND_URL } from "@/constants/globals";
import { Message } from "@/types/models";

interface WebSocketStore {
  /**
   * The WebSocket connection
   */
  socket: WebSocket | null;
  /**
   * Whether the WebSocket is connected
   */
  isConnected: boolean;
  /**
   * Map of message handlers
   */
  messageHandlers: Map<number, (message: Message) => void>;
  /**
   * Connect to the WebSocket
   * @param token  The token to connect with
   * @returns  void
   */
  connect: (token: string) => void;
  /**
   * Disconnect from the WebSocket
   * @returns  void
   */
  disconnect: () => void;
  /**
   * Send a message through the WebSocket
   * @param message  The message to send
   * @returns  void
   */
  sendMessage: (message: { content: string; recipient_id: number }) => void;
  /**
   * Add a message listener
   * @param recipientId  The recipient ID
   * @param callback  The callback to be called when a message is received
   * @returns  void
   */
  addMessageListener: (
    recipientId: number,
    callback: (message: Message) => void
  ) => void;
  /**
   * Remove a message listener
   * @param recipientId  The recipient ID
   * @returns  void
   */
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
      console.log(handler);
      if (handler) {
        handler(message);
      }
      const otherHandler = get().messageHandlers.get(message.sender_id);
      console.log(otherHandler);
      if (otherHandler) {
        otherHandler(message);
      }
      const therapistHandler = get().messageHandlers.get(-1);
      console.log(therapistHandler);
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
