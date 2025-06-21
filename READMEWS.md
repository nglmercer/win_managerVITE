# WebSocket Window Manager

Un servicio completo para gestionar ventanas de navegador a través de WebSockets con soporte para Tauri y navegadores web.

## 🚀 Características

- ✅ **Gestión de Ventanas**: Crear, cerrar, enfocar ventanas
- ✅ **Navegación**: Navegar y recargar páginas en ventanas existentes
- ✅ **Transparencia**: Toggle de transparencia de ventanas
- ✅ **Always On Top**: Mantener ventanas siempre visibles
- ✅ **Información de Estado**: Consultar información detallada de ventanas
- ✅ **Reconexión Automática**: Reconexión automática con backoff exponencial
- ✅ **Compatibilidad**: Funciona en Tauri y navegadores web
- ✅ **TypeScript**: Tipado completo con interfaces TypeScript

## 📦 Instalación

```typescript
import { WebSocketService } from './websocket-service';

// Crear instancia del servicio
const wsService = new WebSocketService();

// O con URL personalizada
const wsService = new WebSocketService('ws://localhost:8080/ws');
```

## 🔧 API Reference

### Métodos Básicos de Ventana

#### `createWindow(label, url, transparent?, alwaysOnTop?)`
Crea una nueva ventana o enfoca una existente.

```typescript
// Ventana básica
await wsService.createWindow('my-window', 'https://example.com');

// Ventana transparente
await wsService.createWindow('transparent-window', 'https://example.com', true);

// Ventana siempre visible
await wsService.createWindow('top-window', 'https://example.com', false, true);

// Ventana con todas las opciones
await wsService.createWindow('advanced-window', 'https://example.com', true, true);
```

#### `closeWindow(label)`
Cierra una ventana específica.

```typescript
await wsService.closeWindow('my-window');
```

#### `focusWindow(label)`
Enfoca una ventana específica.

```typescript
await wsService.focusWindow('my-window');
```

### Métodos de Información

#### `listWindows()`
Obtiene la lista de todas las ventanas.

```typescript
const response = await wsService.listWindows();
console.log(response.data.windows); // Array de WindowInfo
```

#### `getWindowInfo(label)`
Obtiene información detallada de una ventana.

```typescript
const info = await wsService.getWindowInfo('my-window');
console.log(info.data); // WindowInfo object
```

#### `getAllWindowsInfo()`
Método de conveniencia que devuelve directamente el array de ventanas.

```typescript
const windows = await wsService.getAllWindowsInfo();
windows.forEach(window => {
  console.log(`${window.label}: ${window.url}`);
});
```

### Métodos de Navegación

#### `navigateWindow(label, url)`
Navega una ventana a una nueva URL.

```typescript
await wsService.navigateWindow('my-window', 'https://google.com');
```

#### `reloadWindow(label)`
Recarga el contenido de una ventana.

```typescript
await wsService.reloadWindow('my-window');
```

### Métodos de Transparencia

#### `toggleTransparency(label)`
Alterna el estado de transparencia de una ventana.

```typescript
const response = await wsService.toggleTransparency('my-window');
console.log(`Transparency: ${response.data.is_transparent}`);
```

### Métodos de Always On Top

#### `toggleAlwaysOnTop(label)`
Alterna el estado "siempre visible" de una ventana.

```typescript
const response = await wsService.toggleAlwaysOnTop('my-window');
console.log(`Always on top: ${response.data.is_always_on_top}`);
```

#### `setAlwaysOnTop(label, alwaysOnTop)`
Establece un valor específico para "siempre visible".

```typescript
// Activar always on top
await wsService.setAlwaysOnTop('my-window', true);

// Desactivar always on top
await wsService.setAlwaysOnTop('my-window', false);
```

### Métodos de Utilidad

#### `ping()`
Verifica la conexión con el servidor.

```typescript
const response = await wsService.ping();
console.log(response.data.timestamp);
```

#### `windowExists(label)`
Verifica si una ventana existe.

```typescript
const exists = await wsService.windowExists('my-window');
console.log(`Window exists: ${exists}`);
```

#### `closeAllWindows()`
Cierra todas las ventanas abiertas.

```typescript
await wsService.closeAllWindows();
```

#### `createAdvancedWindow(options)`
Crea una ventana con configuración completa.

```typescript
await wsService.createAdvancedWindow({
  label: 'advanced-window',
  url: 'https://example.com',
  transparent: true,
  alwaysOnTop: true
});
```

### Métodos de Conexión

#### `isConnected()`
Verifica si el WebSocket está conectado.

```typescript
if (wsService.isConnected()) {
  console.log('WebSocket is connected');
}
```

#### `disconnect()`
Desconecta el WebSocket y cancela reconexiones automáticas.

```typescript
wsService.disconnect();
```

#### `getUrl()`
Obtiene la URL actual del WebSocket.

```typescript
console.log(`WebSocket URL: ${wsService.getUrl()}`);
```

## 📡 Eventos

El servicio extiende `EventTarget` y emite varios eventos:

### `connected`
Se dispara cuando se establece la conexión WebSocket.

```typescript
wsService.onWindowEvent('connected', () => {
  console.log('WebSocket connected!');
});
```

### `disconnected`
Se dispara cuando se pierde la conexión WebSocket.

```typescript
wsService.onWindowEvent('disconnected', () => {
  console.log('WebSocket disconnected!');
});
```

### `message`
Se dispara cuando se recibe un mensaje del servidor.

```typescript
wsService.onWindowEvent('message', (event) => {
  const response = event.detail;
  console.log('Received:', response);
});
```

### `error`
Se dispara cuando ocurre un error de WebSocket.

```typescript
wsService.onWindowEvent('error', (event) => {
  console.error('WebSocket error:', event.detail);
});
```

## 🏗️ Interfaces TypeScript

### `WindowInfo`
```typescript
interface WindowInfo {
  label: string;
  url: string;
  title: string;
  created_at: number;
  is_visible: boolean;
  is_focused: boolean;
  is_transparent: boolean;
  is_always_on_top: boolean;
}
```

### `WebSocketResponse`
```typescript
interface WebSocketResponse {
  success: boolean;
  message: string;
  data?: any;
  action: string;
}
```

### `WebSocketMessage`
```typescript
interface WebSocketMessage {
  action: string;
  label?: string;
  url?: string;
  data?: any;
  params?: Record<string, string>;
  transparent?: boolean;
  always_on_top?: boolean;
}
```

## 💡 Ejemplos de Uso

### Crear un Dashboard Multi-Ventana

```typescript
const wsService = new WebSocketService();

// Esperar a que se conecte
wsService.onWindowEvent('connected', async () => {
  // Crear ventana principal
  await wsService.createWindow('dashboard', 'http://localhost:3000/dashboard');
  
  // Crear ventana de monitoreo (transparente y siempre visible)
  await wsService.createAdvancedWindow({
    label: 'monitoring',
    url: 'http://localhost:3000/monitoring',
    transparent: true,
    alwaysOnTop: true
  });
  
  // Crear ventanas de contenido
  await wsService.createWindow('content-1', 'https://example.com');
  await wsService.createWindow('content-2', 'https://google.com');
});
```

### Gestión Dinámica de Ventanas

```typescript
// Función para crear ventana si no existe
async function ensureWindow(label: string, url: string) {
  const exists = await wsService.windowExists(label);
  if (!exists) {
    await wsService.createWindow(label, url);
  } else {
    await wsService.focusWindow(label);
  }
}

// Navegar todas las ventanas a la misma URL
async function navigateAllWindows(url: string) {
  const windows = await wsService.getAllWindowsInfo();
  const promises = windows.map(window => 
    wsService.navigateWindow(window.label, url)
  );
  await Promise.allSettled(promises);
}

// Toggle transparencia de todas las ventanas
async function toggleAllTransparency() {
  const windows = await wsService.getAllWindowsInfo();
  const promises = windows.map(window => 
    wsService.toggleTransparency(window.label)
  );
  await Promise.allSettled(promises);
}
```

### Monitoreo de Estado

```typescript
// Monitorear cambios en ventanas
wsService.onWindowEvent('message', (event) => {
  const response = event.detail;
  
  switch (response.action) {
    case 'create_window':
      console.log(`Window created: ${response.data.label}`);
      break;
    case 'close_window':
      console.log(`Window closed: ${response.data.label}`);
      break;
    case 'toggle_always_on_top':
      console.log(`Always on top toggled: ${response.data.is_always_on_top}`);
      break;
  }
});

// Obtener estado cada 5 segundos
setInterval(async () => {
  if (wsService.isConnected()) {
    const windows = await wsService.getAllWindowsInfo();
    console.log(`Active windows: ${windows.length}`);
  }
}, 5000);
```

## 🔧 Configuración del Backend

Asegúrate de que tu backend Rust esté configurado con todos los handlers:

```rust
// En websocket_router.rs
match message.action.as_str() {
    "create_window" => self.handle_create_window(message).await,
    "close_window" => self.handle_close_window(message).await,
    "list_windows" => self.handle_list_windows(message).await,
    "get_window_info" => self.handle_get_window_info(message).await,
    "focus_window" => self.handle_focus_window(message).await,
    "reload_window" => self.handle_reload_window(message).await,
    "navigate_window" => self.handle_navigate_window(message).await,
    "toggle_transparency" => self.handle_toggle_transparency(message).await,
    "toggle_always_on_top" => self.handle_toggle_always_on_top(message).await,
    "set_always_on_top" => self.handle_set_always_on_top(message).await,
    "ping" => self.handle_ping(message).await,
    _ => WebSocketResponse::error(&message.action, "Unknown action"),
}
```

## 🐛 Manejo de Errores

El servicio incluye manejo robusto de errores:

```typescript
try {
  await wsService.createWindow('test', 'https://example.com');
} catch (error) {
  if (error.message === 'WebSocket is not connected') {
    console.log('Waiting for connection...');
    // Esperar reconexión
  } else if (error.message === 'Request timeout') {
    console.log('Request took too long');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 📋 Requisitos

- **Frontend**: TypeScript/JavaScript con soporte para WebSockets
- **Backend**: Rust con Tauri y el window manager implementado  
- **Navegador**: Soporte para WebSockets (todos los navegadores modernos)

## 🚀 Próximas Características

- [ ] Soporte para múltiples monitores
- [ ] Gestión de posición y tamaño de ventanas
- [ ] Temas y personalización de ventanas
- [ ] Persistencia de configuración de ventanas
- [ ] Eventos de ventana en tiempo real
- [ ] Soporte para ventanas modales

## 📄 Licencia

MIT License - Libre para uso personal y comercial.