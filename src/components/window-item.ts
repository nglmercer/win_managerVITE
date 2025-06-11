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
    }

    .window-item {
      background: var(--bg-secondary, #f8f9fa);
      border: 2px solid var(--border-color, #dee2e6);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .window-item:hover {
      border-color: var(--primary-color, #007bff);
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
    }

    .window-item.selected {
      border-color: var(--primary-color, #007bff);
      background: var(--primary-light, #e3f2fd);
    }

    .window-item.focused {
      border-color: var(--success-color, #28a745);
      background: var(--success-light, #d4edda);
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
      color: var(--text-primary, #212529);
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
      background: var(--success-color, #28a745);
      color: white;
    }

    .status-hidden {
      background: var(--warning-color, #ffc107);
      color: var(--text-dark, #212529);
    }

    .status-focused {
      background: var(--info-color, #17a2b8);
      color: white;
    }

    .window-details {
      margin-bottom: 12px;
    }

    .window-label {
      font-size: 14px;
      color: var(--text-secondary, #6c757d);
      margin-bottom: 4px;
    }

    .window-url {
      font-size: 13px;
      color: var(--text-muted, #6c757d);
      word-break: break-all;
      margin-bottom: 4px;
    }

    .window-created {
      font-size: 12px;
      color: var(--text-muted, #6c757d);
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
      background: var(--primary-color, #007bff);
      color: white;
    }

    .btn-focus:hover {
      background: var(--primary-dark, #0056b3);
    }

    .btn-close {
      background: var(--danger-color, #dc3545);
      color: white;
    }

    .btn-close:hover {
      background: var(--danger-dark, #c82333);
    }

    .btn-info {
      background: var(--info-color, #17a2b8);
      color: white;
    }

    .btn-info:hover {
      background: var(--info-dark, #138496);
    }

    .focused-indicator {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success-color, #28a745);
      animation: pulse 2s infinite;
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
        </div>

        <div class="window-actions">
          <button class="btn btn-info" @click="${this.handleGetInfo}" title="Get Info">
            Info
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