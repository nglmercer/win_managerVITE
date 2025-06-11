import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { WebSocketService, type WindowInfo, type WebSocketResponse } from '../services/websocket.service.js';

// Importa los componentes que ya tienes
import './create-window-form.js';
import './window-item.js';

// Una interfaz para el estado de las notificaciones
interface AppNotification {
  type: 'success' | 'error';
  message: string;
}

@customElement('window-manager-app')
export class WindowManagerApp extends LitElement {
  @state() private wsService: WebSocketService | null = null;
  @state() private windows: WindowInfo[] = [];
  @state() private isLoading = true;
  @state() public isConnected = false;
  @state() private notification: AppNotification | null = null;

  // Referencia al componente del formulario para poder resetearlo
  private createWindowForm: any; 

  static styles = css`
    :host {
      display: block;
      max-width: 960px;
      margin: 40px auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --primary-color: #007bff;
      --primary-dark: #0056b3;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --warning-color: #ffc107;
      --info-color: #17a2b8;
      --border-color: #dee2e6;
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --text-primary: #212529;
      --text-secondary: #6c757d;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .title {
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
    }
    
    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--danger-color);
    }

    .status-indicator.connected {
      background: var(--success-color);
      animation: pulse 2s infinite;
    }

    .windows-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 40px 0 20px;
    }

    .windows-list-title {
        font-size: 20px;
        font-weight: 600;
    }

    .btn-refresh {
        padding: 8px 16px;
        border: 1px solid var(--primary-color);
        background: transparent;
        color: var(--primary-color);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-refresh:hover {
        background: var(--primary-color);
        color: white;
    }

    .no-windows {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary);
        border: 2px dashed var(--border-color);
        border-radius: 8px;
    }

    .notification {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-weight: 500;
    }

    .notification.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .notification.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
      100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    this.initializeWebSocket();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.wsService?.disconnect();
  }

  private initializeWebSocket(): void {
    // Reemplaza con la URL de tu servidor WebSocket
    this.wsService = new WebSocketService('ws://127.0.0.1:8080/ws');

    this.wsService.addEventListener('connected', () => {
      this.isConnected = true;
      this.showNotification('success', 'Connected to WebSocket server.');
      this.fetchWindowList();
    });

    this.wsService.addEventListener('disconnected', () => {
      this.isConnected = false;
      this.isLoading = true;
      this.showNotification('error', 'Disconnected. Trying to reconnect...');
    });

    // Escucha mensajes generales (como actualizaciones de estado)
    this.wsService.addEventListener('message', (event) => {
        const customEvent = event as CustomEvent<WebSocketResponse>;
        const response = customEvent.detail;
        
        // Si recibimos un mensaje de 'window_update', refrescamos la lista
        if (response.action === 'window_update') {
            console.log('Received window update broadcast, refreshing list...');
            this.fetchWindowList();
        }
    });
  }

  async fetchWindowList(): Promise<void> {
    if (!this.wsService || !this.isConnected) return;
    
    this.isLoading = true;
    try {
      // **IMPORTANTE**: Tu backend debe devolver la información completa, no solo los labels.
      const response = await this.wsService.listWindows();
      if (response.success && response.data?.windows) {
        this.windows = response.data.windows;
      } else {
        this.showNotification('error', response.message || 'Failed to fetch window list.');
        this.windows = [];
      }
    } catch (error) {
      this.showNotification('error', `Error fetching windows: ${(error as Error).message}`);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleCreateWindow(e: CustomEvent): Promise<void> {
    const { label, url } = e.detail;
    this.createWindowForm = e.target; // Guardamos la referencia al formulario

    try {
      const response = await this.wsService?.createWindow(label, url);
      if (response?.success) {
        this.showNotification('success', `Window "${label}" created successfully.`);
        this.createWindowForm?.reset(); // Reseteamos el formulario
        this.fetchWindowList(); // Actualizamos la lista
      } else {
        this.showNotification('error', response?.message || 'Failed to create window.');
        this.createWindowForm?.setLoading(false); // Detenemos el spinner en el formulario
      }
    } catch (error) {
      this.showNotification('error', `Error: ${(error as Error).message}`);
      this.createWindowForm?.setLoading(false);
    }
  }

  private async handleWindowAction(e: CustomEvent): Promise<void> {
    const { label } = e.detail;
    const actionType = e.type; // 'close-window', 'focus-window', etc.

    if (!this.wsService) return;

    let promise: Promise<WebSocketResponse> | undefined;

    switch (actionType) {
        case 'close-window':
            promise = this.wsService.closeWindow(label);
            break;
        case 'focus-window':
            promise = this.wsService.focusWindow(label);
            break;
        case 'get-window-info':
            promise = this.wsService.getWindowInfo(label);
            break;
    }

    if (promise) {
        try {
            const response = await promise;
            if (response.success) {
                this.showNotification('success', response.message);
                // Si la acción fue get-info, podemos mostrar los datos en la consola o en un modal
                if (actionType === 'get-window-info') {
                    console.log('Window Info:', response.data);
                }
            } else {
                this.showNotification('error', response.message);
            }
        } catch (error) {
            this.showNotification('error', `Action failed: ${(error as Error).message}`);
        } finally {
            // Siempre refrescar la lista para reflejar los cambios de estado (foco, visibilidad, etc.)
            this.fetchWindowList();
        }
    }
  }

  private showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    setTimeout(() => {
      this.notification = null;
    }, 5000); // La notificación desaparece después de 5 segundos
  }

  render() {
    return html`
      <div class="header">
        <h1 class="title">Tauri Window Manager</h1>
        <div class="status">
          <div class="status-indicator ${this.isConnected ? 'connected' : ''}"></div>
          <span>${this.isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
      
      ${this.notification ? html`
        <div class="notification ${this.notification.type}">
          ${this.notification.message}
        </div>
      ` : ''}

      <create-window-form @create-window=${this.handleCreateWindow}></create-window-form>
      
      <div class="windows-list-header">
        <h2 class="windows-list-title">Managed Windows (${this.windows.length})</h2>
        <button class="btn-refresh" @click=${this.fetchWindowList} ?disabled=${this.isLoading}>
            ${this.isLoading ? 'Loading...' : 'Refresh List'}
        </button>
      </div>

      <div class="windows-list">
        ${this.isLoading && this.windows.length === 0
          ? html`<div class="no-windows">Loading windows...</div>`
          : this.windows.length > 0
            ? this.windows.map(win => html`
                <window-item 
                  .window=${win}
                  @close-window=${this.handleWindowAction}
                  @focus-window=${this.handleWindowAction}
                  @get-window-info=${this.handleWindowAction}
                ></window-item>
              `)
            : html`<div class="no-windows">No windows have been created yet.</div>`
        }
      </div>
    `;
  }
}