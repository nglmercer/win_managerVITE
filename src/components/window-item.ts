import { LitElement, html, css,type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { type WindowInfo } from '../services/websocket.service.js';

@customElement('window-item')
export class WindowItemComponent extends LitElement {
  @property({ type: Object }) window!: WindowInfo;
  @property({ type: Boolean }) selected = false;

  static styles = css`
    :host {
      display: block;
      margin-bottom: 8px;

      --primary-color: #007bff;
      --primary-dark: #0056b3;
      --primary-light: #e3f2fd;
      --secondary-color: #6c757d;
      --danger-color: #dc3545;
      --danger-dark: #c82333;
      --success-color: #28a745;
      --success-light: #d4edda;
      --warning-color: #ffc107;
      --info-color: #17a2b8;
      --info-dark: #138496;
      --border-color: #dee2e6;
      --bg-secondary: #f8f9fa;
      --text-primary: #212529;
      --text-secondary: #6c757d;
      --text-muted: #6c757d;
      --text-dark: #212529;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --primary-color: #66b2ff;
        --primary-dark: #3399ff;
        --primary-light: #1a2a3a;
        --secondary-color: #999ea2;
        --danger-color: #ff6b6b;
        --danger-dark: #e55353;
        --success-color: #51d88a;
        --success-light: #253b2d;
        --warning-color: #ffd65a;
        --info-color: #4cc9f0;
        --info-dark: #3aa7cb;
        --border-color: #444c56;
        --bg-secondary: #2c2c2c;
        --text-primary: #f1f1f1;
        --text-secondary: #aaaaaa;
        --text-muted: #888888;
        --text-dark: #f8f9fa;
      }
    }

    .window-item {
      background: var(--bg-secondary);
      border: 2px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .window-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
    }

    .window-item.selected {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }

    .window-item.focused {
      border-color: var(--success-color);
      background: var(--success-light);
    }

    .window-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .window-title {
      font-weight: 600;
      font-size: 16px;
      color: var(--text-primary);
      margin: 0;
      flex: 1;
      margin-right: 12px;
    }

    .window-status {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-visible {
      background: var(--success-color);
      color: white;
    }

    .status-hidden {
      background: var(--warning-color);
      color: var(--text-dark);
    }

    .status-focused {
      background: var(--info-color);
      color: white;
    }

    .window-details {
      margin-bottom: 12px;
    }

    .window-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 4px;
    }

    .window-url {
      font-size: 13px;
      color: var(--text-muted);
      word-break: break-all;
      margin-bottom: 4px;
    }

    .window-created {
      font-size: 12px;
      color: var(--text-muted);
    }

    .window-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }

    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
    }

    .btn-focus {
      background: var(--primary-color);
      color: white;
    }

    .btn-focus:hover {
      background: var(--primary-dark);
    }

    .btn-close {
      background: var(--danger-color);
      color: white;
    }

    .btn-close:hover {
      background: var(--danger-dark);
    }

    .btn-info {
      background: var(--info-color);
      color: white;
    }

    .btn-info:hover {
      background: var(--info-dark);
    }

    .focused-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success-color);
      animation: pulse 2s infinite;
    }
    .btn-warning {
      background: var(--warning-color);
      color: var(--text-dark);
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
      }
    }
  `;


  protected willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('window')) {
      this.requestUpdate();
    }
  }

  private formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  private handleFocus(): void {
    this.dispatchEvent(new CustomEvent('focus-window', {
      detail: { label: this.window.label },
      bubbles: true
    }));
  }

  private handleClose(): void {
    this.dispatchEvent(new CustomEvent('close-window', {
      detail: { label: this.window.label },
      bubbles: true
    }));
  }

  private handleGetInfo(): void {
    this.dispatchEvent(new CustomEvent('get-window-info', {
      detail: { label: this.window.label },
      bubbles: true
    }));
  }

  private handleClick(): void {
    this.dispatchEvent(new CustomEvent('select-window', {
      detail: { label: this.window.label },
      bubbles: true
    }));
  }
  private handleToggleTransparency(): void {
    this.dispatchEvent(new CustomEvent('toggle-transparency', {
      detail: { label: this.window.label },
      bubbles: true
    }));
  }
  
  private handleToggleAlwaysOnTop(): void {
    this.dispatchEvent(new CustomEvent('toggle-always-on-top', {
      detail: { label: this.window.label },
      bubbles: true
    }));
  }
  
  render() {
    const itemClasses = [
      'window-item',
      this.selected ? 'selected' : '',
      this.window.is_focused ? 'focused' : ''
    ].filter(Boolean).join(' ');

    return html`
      <div class="${itemClasses}" @click="${this.handleClick}">
        ${this.window.is_focused ? html`<div class="focused-indicator"></div>` : ''}
        
        <div class="window-header">
          <h3 class="window-title">${this.window.title}</h3>
          <div class="window-status">
            <span class="status-badge ${this.window.is_visible ? 'status-visible' : 'status-hidden'}">
              ${this.window.is_visible ? 'Visible' : 'Hidden'}
            </span>
            ${this.window.is_focused ? html`
              <span class="status-badge status-focused">Focused</span>
            ` : ''}
          </div>
        </div>

        <div class="window-details">
          <div class="window-label">
            <strong>Label:</strong> ${this.window.label}
          </div>
          <div class="window-url">
            <strong>URL:</strong> ${this.window.url}
          </div>
          <div class="window-created">
            <strong>Created:</strong> ${this.formatDate(this.window.created_at)}
          </div>
          <div class="window-properties">
            <strong>Properties:</strong> 
            ${this.window.is_transparent ? 'Transparent' : 'Opaque'}
            ${this.window.is_always_on_top ? ' • Always On Top' : ''}
          </div>
        </div>

        <div class="window-actions">
          <button class="btn btn-info" @click="${this.handleGetInfo}" title="Get Info">
            Info
          </button>
          <button 
            class="btn ${this.window.is_transparent ? 'btn-warning' : 'btn-secondary'}" 
            @click="${this.handleToggleTransparency}" 
            title="Toggle Transparency"
          >
            ${this.window.is_transparent ? 'Opaque' : 'Transparent'}
          </button>
          <button 
            class="btn ${this.window.is_always_on_top ? 'btn-warning' : 'btn-secondary'}" 
            @click="${this.handleToggleAlwaysOnTop}" 
            title="Toggle Always On Top"
          >
            ${this.window.is_always_on_top ? 'Normal' : 'On Top'}
          </button>
          <button class="btn btn-focus" @click="${this.handleFocus}" title="Focus Window">
            Focus
          </button>
          <button class="btn btn-close" @click="${this.handleClose}" title="Close Window">
            Close
          </button>
        </div>
      </div>
    `;
  }
}