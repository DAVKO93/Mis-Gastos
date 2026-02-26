# 💸 MisGastos — Registro de Gastos

App PWA para registrar gastos personales. Funciona **online y offline**.

---

## 🚀 Despliegue en Vercel (5 minutos)

### Opción A — Sin código (recomendado)

1. Crea cuenta gratis en **[github.com](https://github.com)** si no tienes
2. Crea un repositorio nuevo llamado `mis-gastos`
3. Sube todos los archivos de esta carpeta al repositorio
4. Ve a **[vercel.com](https://vercel.com)** → "Add New Project"
5. Conecta tu cuenta de GitHub y selecciona el repositorio `mis-gastos`
6. Vercel detecta automáticamente que es Vite → clic en **"Deploy"**
7. En ~2 minutos tienes tu URL: `https://mis-gastos.vercel.app`

### Opción B — Con terminal

```bash
# 1. Instalar dependencias
npm install

# 2. Instalar Vercel CLI
npm install -g vercel

# 3. Desplegar (solo la primera vez pide login)
vercel --prod
```

---

## 📱 Instalar en el teléfono (Android)

1. Abre la URL de tu app en **Chrome**
2. Toca el ícono de menú (⋮) → **"Añadir a pantalla de inicio"**
3. Dale un nombre → **"Añadir"**
4. ¡Listo! Aparece como app nativa en tu teléfono

## 📱 Instalar en iPhone (iOS)

1. Abre la URL en **Safari** (obligatorio, no Chrome)
2. Toca el botón de compartir (□↑) → **"Añadir a pantalla de inicio"**
3. Dale un nombre → **"Añadir"**

---

## 💻 Correr en local (desarrollo)

```bash
npm install
npm run dev
# Abre http://localhost:5173
```

---

## 📁 Estructura del proyecto

```
mis-gastos/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx        ← Punto de entrada
│   └── App.jsx         ← App completa
├── index.html
├── package.json
├── vite.config.js      ← Config Vite + PWA offline
└── vercel.json         ← Config despliegue
```

---

## ✨ Funcionalidades

- ➕ Registrar gastos con categoría, método de pago y notas
- 🏠 Dashboard con total del mes, hoy y promedio
- 📊 Estadísticas con barras por categoría y historial mensual
- 🔍 Filtro por categoría
- 💾 **Funciona offline** — guarda en el dispositivo
- 🔄 Indicador de sincronización pendiente
- 🗑️ Eliminar gastos
- 📱 Diseño mobile-first, instalable como app

---

## 🛠️ Tecnologías

- React 18 + Vite
- vite-plugin-pwa (offline / Service Worker)
- localStorage para persistencia de datos
- CSS-in-JS (sin dependencias de UI externas)
