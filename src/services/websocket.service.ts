export interface WebSocketMessage {
  action: string;
  label?: string;
  url?: string;
  data?: any;
  params?: Record<string, string>;
  transparent?: boolean;
  always_on_top?: boolean; // <--- NUEVO CAMPO
}

export interface WebSocketResponse {
  success: boolean;
  message: string;
  data?: any;
  action: string;
}

export interface WindowInfo {
  label: string;
  url: string;
  title: string;
  created_at: number;
  is_visible: boolean;
  is_focused: boolean;
  is_transparent: boolean; // <--- AGREGADO
  is_always_on_top: boolean; // <--- NUEVO CAMPO
}

export class WebSocketService extends EventTarget {
  private ws: WebSocket | null = null;
  private reconnectTimeout: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string | undefined;

  constructor(customUrl?: string) {
    super();
    if (customUrl) this.url = customUrl;
    this.connect();
  }

  async getWebSocketUrl(): Promise<string> {
    let url;
    //@ts-expect-error
    if (window.__TAURI__) {
      //@ts-expect-error
      const invoke = window.__TAURI__.core?.invoke;
        try {
          url = await invoke<string>('get_websocket_url');
          this.url = url;
          return url;
        } catch (error) {
            console.error('Failed to get WebSocket URL from Tauri backend:', error);
            throw error;
        }
    } else {
        // Estamos en un navegador web, usar la lógica anterior
        if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
          url = 'ws://localhost:51840/ws';
          this.url = url;
          return url
        }
        
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        url = `${protocol}//${host}/ws`;
        this.url = url;
        return url;
    }
  }

  private async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(await this.getWebSocketUrl());
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.dispatchEvent(new CustomEvent('connected'));
      };

      this.ws.onmessage = (event) => {
        try {
          const response: WebSocketResponse = JSON.parse(event.data);
          this.dispatchEvent(new CustomEvent('message', { detail: response }));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.dispatchEvent(new CustomEvent('disconnected'));
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.dispatchEvent(new CustomEvent('error', { detail: error }));
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimeout = window.setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  private sendMessage(message: WebSocketMessage): Promise<WebSocketResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const messageHandler = (event: Event) => {
        const customEvent = event as CustomEvent<WebSocketResponse>;
        const response = customEvent.detail;
        if (response.action === message.action) {
          this.removeEventListener('message', messageHandler);
          resolve(response);
        }
      };

      this.addEventListener('message', messageHandler);

      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        this.removeEventListener('message', messageHandler);
        reject(error);
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        this.removeEventListener('message', messageHandler);
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }

  // ============ MÉTODOS BÁSICOS DE VENTANA ============
  
  async createWindow(
    label: string, 
    url: string, 
    transparent: boolean = false, 
    alwaysOnTop: boolean = false
  ): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'create_window',
      label,
      url,
      transparent,
      always_on_top: alwaysOnTop
    });
  }

  async closeWindow(label: string): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'close_window',
      label
    });
  }

  async focusWindow(label: string): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'focus_window',
      label
    });
  }

  // ============ MÉTODOS DE INFORMACIÓN ============

  async listWindows(): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'list_windows'
    });
  }

  async getWindowInfo(label: string): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'get_window_info',
      label
    });
  }

  // ============ MÉTODOS DE NAVEGACIÓN ============

  async reloadWindow(label: string): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'reload_window',
      label
    });
  }

  async navigateWindow(label: string, url: string): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'navigate_window',
      label,
      url
    });
  }

  // ============ MÉTODOS DE TRANSPARENCIA ============

  async toggleTransparency(label: string): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'toggle_transparency',
      label
    });
  }

  // ============ MÉTODOS DE ALWAYS ON TOP ============

  async toggleAlwaysOnTop(label: string): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'toggle_always_on_top',
      label
    });
  }

  async setAlwaysOnTop(label: string, alwaysOnTop: boolean): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'set_always_on_top',
      label,
      always_on_top: alwaysOnTop
    });
  }

  // ============ MÉTODOS DE UTILIDAD ============

  async ping(): Promise<WebSocketResponse> {
    return this.sendMessage({
      action: 'ping'
    });
  }

  // ============ MÉTODOS DE CONEXIÓN ============

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Método para obtener la URL actual (útil para debugging)
  getUrl(): string | undefined {
    return this.url;
  }

  // ============ MÉTODOS DE CONVENIENCIA ============

  /**
   * Crea una ventana con configuración completa
   */
  async createAdvancedWindow(options: {
    label: string;
    url: string;
    transparent?: boolean;
    alwaysOnTop?: boolean;
  }): Promise<WebSocketResponse> {
    return this.createWindow(
      options.label,
      options.url,
      options.transparent ?? false,
      options.alwaysOnTop ?? false
    );
  }

  /**
   * Obtiene todas las ventanas con su información completa
   */
  async getAllWindowsInfo(): Promise<WindowInfo[]> {
    const response = await this.listWindows();
    if (response.success && response.data?.windows) {
      return response.data.windows as WindowInfo[];
    }
    return [];
  }

  /**
   * Verifica si una ventana existe
   */
  async windowExists(label: string): Promise<boolean> {
    try {
      const response = await this.getWindowInfo(label);
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Cierra todas las ventanas
   */
  async closeAllWindows(): Promise<void> {
    const windows = await this.getAllWindowsInfo();
    const closePromises = windows.map(window => this.closeWindow(window.label));
    await Promise.allSettled(closePromises);
  }

  // ============ MÉTODOS DE EVENTOS ============

  /**
   * Añade un listener para eventos específicos
   */
  onWindowEvent(eventType: 'connected' | 'disconnected' | 'error' | 'message', callback: (event: any) => void): void {
    this.addEventListener(eventType, callback);
  }

  /**
   * Remueve un listener de eventos
   */
  offWindowEvent(eventType: string, callback: (event: any) => void): void {
    this.removeEventListener(eventType, callback);
  }
}