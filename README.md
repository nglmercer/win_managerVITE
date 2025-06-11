# Win Manager

Un gestor de ventanas moderno construido con Vite, TypeScript y Lit.

## Descripción

Win Manager es una aplicación web que permite gestionar ventanas de manera eficiente. Está construida utilizando tecnologías modernas como Vite, TypeScript y Lit para ofrecer una experiencia de usuario fluida y un desarrollo eficiente.

## Características

- Gestión de ventanas
- Interfaz de usuario moderna y responsiva
- Componentes reutilizables
- Tipado estático con TypeScript

## Tecnologías Utilizadas

- [Vite](https://vitejs.dev/) - Build tool y servidor de desarrollo
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [Lit](https://lit.dev/) - Biblioteca para construir componentes web
- [Node.js](https://nodejs.org/) - Entorno de ejecución

## Requisitos Previos

- Node.js (versión recomendada: 18.x o superior)
- npm o yarn

## Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd win_manager
```

2. Instala las dependencias:
```bash
npm install
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

## Construcción

Para construir el proyecto para producción:

```bash
npm run build
```

## Vista Previa

Para previsualizar la versión de producción:

```bash
npm run preview
```

## Estructura del Proyecto

```
win_manager/
├── src/
│   ├── components/     # Componentes de la aplicación
│   ├── services/       # Servicios y lógica de negocio
│   ├── assets/         # Recursos estáticos
│   └── main.ts         # Punto de entrada
├── public/             # Archivos públicos
└── dist/              # Archivos de construcción
```