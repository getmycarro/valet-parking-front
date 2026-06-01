# GetMyCarro · App (Vite + React)

Migration of the GetMyCarro prototype to a proper **Vite + React 18 + React Router** project.

## Cómo correr

```bash
cd app
npm install
npm run dev
```

La app abre en `http://localhost:5173`.

```bash
npm run build      # bundle producción a dist/
npm run preview    # sirve el dist/ localmente
```

## Estructura

```
app/
├── package.json
├── vite.config.js
├── index.html                  # Vite entry
├── public/
│   ├── brand-mark.png
│   ├── icon-light-32x32.png
│   └── icon-dark-32x32.png
└── src/
    ├── main.jsx                # ReactDOM.createRoot + BrowserRouter
    ├── App.jsx                 # Routes: / → LandingPage · /admin/* → AdminApp
    ├── store.jsx               # VehicleStoreProvider + useVehicleStore
    ├── hooks/
    │   └── useTheme.js         # Light/dark hook — FIX para el bug del toggle
    ├── styles/
    │   ├── tokens.css          # Variables CSS · colors + type
    │   ├── landing.css         # Marketing site
    │   └── admin.css           # Admin shell
    ├── components/
    │   ├── icons.jsx           # <Icon> + <Logo>
    │   └── ui.jsx              # Sidebar, Topbar, KpiCard, Modal, Toast, etc.
    ├── pages/
    │   ├── LandingPage.jsx     # / — sitio público con toggle de tema
    │   └── AdminApp.jsx        # /admin — login + dashboard multirol
    └── screens/
        ├── screens.jsx         # Login, Dashboard, Vehicles, Employees, RegisterVehicleModal
        └── role-screens.jsx    # Companies, Users, AttendantDashboard
```

## Rutas

| Ruta | Vista |
|---|---|
| `/`         | Landing — sitio de marketing con toggle light/dark |
| `/admin`    | Login + panel admin (sidebar + topbar + modal de registrar vehículo) |

El rol se infiere del email al iniciar sesión:
- `carlos@getmycarro.com` → super_admin
- `maria@hotelpremium.com` → admin
- `daniela@hotelpremium.com` → manager
- `luis@hotelpremium.com` → attendant (sin sidebar, vista de campo)

## Bug del modo claro — resuelto

El antiguo `index.html` usaba JS imperativo para alternar `html.dark`. En esta versión hay un hook `useTheme()` que mantiene React state sincronizado con la clase del `<html>` y `localStorage`, sin desfases visuales. Click → cambio inmediato.

## Notas técnicas

- React 18.3.1 + React Router 6.26
- Vite 5.4 con `@vitejs/plugin-react`
- Sin TypeScript (todo en `.jsx` para mantener paridad 1-a-1 con el prototipo). Si quieres TS, añade `tsconfig.json` y renombra a `.tsx`.
- El store comparte vehículos y dueños entre todas las vistas vía React Context.
- Las imágenes en `public/` se sirven con paths absolutos (`/brand-mark.png`).
