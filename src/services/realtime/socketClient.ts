/** Shared browser WebSocket client; feature modules can subscribe without reconnect logic. */

export interface SocketMessage {
  type: string;
  [key: string]: unknown;
}

type MessageListener = (message: SocketMessage) => void;

const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
const socketUrl = `${backendUrl.replace(/\/$/, "").replace(/^http/, "ws")}/api/ws`;

class SocketClient {
  private socket: WebSocket | null = null;
  private connection: Promise<void> | null = null;
  private readonly listeners = new Set<MessageListener>();

  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connection) return this.connection;

    this.connection = new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(socketUrl);
      this.socket = socket;

      socket.onopen = () => {
        this.connection = null;
        resolve();
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as SocketMessage;
          this.listeners.forEach((listener) => listener(message));
        } catch {
          // Ignore malformed transport messages; domain consumers only receive JSON events.
        }
      };
      socket.onerror = () => {
        this.connection = null;
        reject(new Error("Realtime connection failed"));
      };
      socket.onclose = () => {
        this.socket = null;
        this.connection = null;
      };
    });

    return this.connection;
  }

  send(type: string, payload: Record<string, unknown> = {}): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify({ type, ...payload }));
  }

  onMessage(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.connection = null;
  }
}

export const socketClient = new SocketClient();

/** Function API for feature code that should not depend on the client implementation class. */
export const connectSocket = (): Promise<void> => socketClient.connect();
export const sendSocketMessage = (
  type: string,
  payload: Record<string, unknown> = {}
): void => socketClient.send(type, payload);
export const listenSocketMessage = (listener: MessageListener): (() => void) =>
  socketClient.onMessage(listener);
export const disconnectSocket = (): void => socketClient.disconnect();
