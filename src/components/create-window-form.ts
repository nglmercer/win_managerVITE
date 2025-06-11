import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('create-window-form')
export class CreateWindowFormComponent extends LitElement {
  @state() private label = '';
  @state() private url = '';
  @state() private isLoading = false;

  static styles = css`
    :host {
      display: block;
      background: var(--bg-primary, white);
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .form-title {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary, #212529);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--text-primary, #212529);
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color, #ced4da);
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary-color, #007bff);
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .form-input.error {
      border-color: var(--danger-color, #dc3545);
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 80px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--primary-color, #007bff);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark, #0056b3);
    }

    .btn-secondary {
      background: var(--secondary-color, #6c757d);
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--secondary-dark, #5a6268);
    }

    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 1s ease-in-out infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .form-help {
      font-size: 12px;
      color: var(--text-muted, #6c757d);
      margin-top: 4px;
    }

    .quick-urls {
      margin-top: 12px;
    }

    .quick-urls-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary, #6c757d);
      margin-bottom: 8px;
    }

    .quick-url-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .quick-url-btn {
      padding: 4px 8px;
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 4px;
      background: var(--bg-light, #f8f9fa);
      color: var(--text-secondary, #6c757d);
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .quick-url-btn:hover {
      background: var(--primary-color, #007bff);
      color: white;
      border-color: var(--primary-color, #007bff);
    }
  `;

  private quickUrls = [
    { label: 'Google', url: 'https://www.google.com' },
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'YouTube', url: 'https://www.youtube.com' },
    { label: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { label: 'MDN', url: 'https://developer.mozilla.org' }
  ];

  private handleSubmit(e: Event): void {
    e.preventDefault();
    
    if (!this.label.trim() || !this.url.trim()) {
      return;
    }

    if (!this.isValidUrl(this.url)) {
      return;
    }

    this.isLoading = true;

    this.dispatchEvent(new CustomEvent('create-window', {
      detail: {
        label: this.label.trim(),
        url: this.url.trim()
      },
      bubbles: true
    }));
  }

  private handleReset(): void {
    this.label = '';
    this.url = '';
  }

  private handleQuickUrl(url: string): void {
    this.url = url;
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  public setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  public reset(): void {
    this.handleReset();
    this.isLoading = false;
  }

  render() {
    const isFormValid = this.label.trim() && this.url.trim() && this.isValidUrl(this.url);

    return html`
      <h2 class="form-title">Create New Window</h2>
      
      <form @submit="${this.handleSubmit}">
        <div class="form-group">
          <label class="form-label" for="label">Window Label</label>
          <input
            id="label"
            class="form-input"
            type="text"
            placeholder="Enter a unique label for the window"
            .value="${this.label}"
            @input="${(e: Event) => this.label = (e.target as HTMLInputElement).value}"
            ?disabled="${this.isLoading}"
            required
          />
          <div class="form-help">
            A unique identifier for the window (e.g., "main-browser", "docs-viewer")
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="url">URL</label>
          <input
            id="url"
            class="form-input ${this.url && !this.isValidUrl(this.url) ? 'error' : ''}"
            type="url"
            placeholder="https://example.com"
            .value="${this.url}"
            @input="${(e: Event) => this.url = (e.target as HTMLInputElement).value}"
            ?disabled="${this.isLoading}"
            required
          />
          <div class="form-help">
            The URL to load in the new window
          </div>
          
          <div class="quick-urls">
            <div class="quick-urls-title">Quick URLs:</div>
            <div class="quick-url-buttons">
              ${this.quickUrls.map(item => html`
                <button
                  type="button"
                  class="quick-url-btn"
                  @click="${() => this.handleQuickUrl(item.url)}"
                  ?disabled="${this.isLoading}"
                >
                  ${item.label}
                </button>
              `)}
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="${this.handleReset}"
            ?disabled="${this.isLoading}"
          >
            Reset
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            ?disabled="${!isFormValid || this.isLoading}"
          >
            ${this.isLoading ? html`
              <span class="loading-spinner"></span>
              Creating...
            ` : 'Create Window'}
          </button>
        </div>
      </form>
    `;
  }
}