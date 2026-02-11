# Integración Frontend-Backend: Valet Parking System

## ✅ Cambios Completados

### 1. **Infraestructura de Servicios API**

Se creó una capa completa de servicios para comunicarse con el backend NestJS:

#### Archivos Creados:

- **[`lib/api-client.ts`](lib/api-client.ts)** - Cliente HTTP centralizado
  - Configuración de axios con base URL
  - Interceptor automático para agregar JWT tokens
  - Manejo de errores 401 (redirige a login si el token expira)
  - Métodos: `get()`, `post()`, `patch()`, `delete()`
  - Gestión de tokens: `setToken()`, `getToken()`, `clearToken()`

- **[`lib/services/auth-service.ts`](lib/services/auth-service.ts)** - Autenticación
  - `login(email, password)` → POST /api/auth/login
  - `register(data)` → POST /api/auth/register
  - `me()` → GET /api/auth/me
  - `logout()` → Limpia token local
  - `isAuthenticated()` → Verifica si hay token

- **[`lib/services/vehicles-service.ts`](lib/services/vehicles-service.ts)** - Vehículos
  - `registerManual(data)` → POST /api/vehicles/register
  - `registerQR(data)` → POST /api/vehicles/register/qr
  - `checkout(id, data)` → PATCH /api/vehicles/:id/checkout
  - `searchByEmployee(idNumber)` → GET /api/vehicles/search?idNumber=...
  - `getActive()` → GET /api/vehicles/active
  - `getById(id)` → GET /api/vehicles/:id
  - `getAll(page, limit)` → GET /api/vehicles?page=...&limit=...

- **[`lib/services/payments-service.ts`](lib/services/payments-service.ts)** - Pagos
  - `create(data)` → POST /api/payments
  - `getAll()` → GET /api/payments
  - `updateStatus(id, status)` → PATCH /api/payments/:id/status
  - `createMethod(data)` → POST /api/payments/methods
  - `getMethods()` → GET /api/payments/methods

- **[`lib/services/settings-service.ts`](lib/services/settings-service.ts)** - Configuración
  - `get()` → GET /api/settings
  - `updateBilling(data)` → PATCH /api/settings/billing
  - `updateTip(data)` → PATCH /api/settings/tip

- **[`lib/services/reports-service.ts`](lib/services/reports-service.ts)** - Reportes
  - `getRevenue(period, startDate, endDate)` → GET /api/reports/revenue
  - `getVehicles(startDate, endDate)` → GET /api/reports/vehicles
  - `getSummary()` → GET /api/reports/summary

### 2. **Actualización del Sistema de Autenticación**

Se migró [`lib/auth.tsx`](lib/auth.tsx) de localStorage a API real:

**Antes (localStorage):**
```typescript
login: (name: string, role: UserRole) => void
```

**Ahora (API):**
```typescript
login: (email: string, password: string) => Promise<void>
```

**Cambios:**
- ✅ Autenticación con email/password via API
- ✅ Almacenamiento de JWT token en localStorage
- ✅ Carga automática del usuario al montar (verifica token)
- ✅ Logout limpia token y estado
- ✅ Nuevo campo `isLoading` en el context
- ✅ Usuario ahora incluye: `id`, `email`, `phone`, `idNumber`, `photoUrl`
- ✅ Mapeo automático de roles API (`ADMIN` → `admin`, `ATTENDANT` → `attendant`)

### 3. **Configuración de Entorno**

Creado [`.env.local`](.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🚧 Tareas Pendientes

### CRÍTICO - Actualizar Store Provider

El archivo [`lib/store.tsx`](lib/store.tsx) todavía usa localStorage. Necesita ser actualizado para:

1. **Cargar datos iniciales de la API** (en lugar de localStorage):
   - Settings → `settingsService.get()`
   - Payment Methods → `paymentsService.getMethods()`
   - Active Vehicles → `vehiclesService.getActive()`

2. **Actualizar acciones del store** para llamar a la API:

   **Vehículos:**
   - `registerCarManual()` → `vehiclesService.registerManual()`
   - `registerCarQR()` → `vehiclesService.registerQR()`
   - `deliverCar()` → `vehiclesService.checkout()`

   **Pagos:**
   - `addPayment()` → `paymentsService.create()`
   - `updatePaymentStatus()` → `paymentsService.updateStatus()`
   - `addPaymentMethod()` → `paymentsService.createMethod()`

   **Configuración:**
   - `updateBilling()` → `settingsService.updateBilling()`
   - `setTipEnabled()` → `settingsService.updateTip()`

3. **Remover persistencia a localStorage** (líneas 178-194)

### IMPORTANTE - Actualizar Componentes

Algunos componentes necesitan ajustes menores:

1. **[`components/login-form.tsx`](components/login-form.tsx)**
   - Cambiar de `login(name, role)` a `login(email, password)`
   - Agregar campos de email y password en el formulario
   - Manejar estado de loading con `isLoading`
   - Manejar errores de la API

2. **[`lib/types.ts`](lib/types.ts)**
   - Actualizar tipos para coincidir con la API:
     - `PaymentMethodType`: agregar `"CASH"` y `"CARD"`
     - `PaymentStatus`: agregar `"CANCELLED"`
     - `BillingType`: cambiar a uppercase (`"HOURLY"`, `"FLAT_RATE"`)
   - Considerar usar los tipos de los servicios directamente

3. **[`components/providers.tsx`](components/providers.tsx)**
   - Remover llamada a `migrateLocalStorage()` (ya no es necesario)

### OPCIONAL - Mejoras

- Agregar manejo de errores global (toast notifications)
- Implementar loading states en componentes
- Agregar retry logic para requests fallidos
- Implementar refresh token mechanism
- Agregar validación de formularios con schemas (zod)

---

## 🧪 Cómo Probar la Integración

### 1. **Iniciar el Backend (API)**

```bash
cd /Users/jesusortiz/Documents/trae_projects/valet-parking-api

# Asegurarse de que PostgreSQL esté corriendo
# y que las migraciones estén aplicadas

npm run start:dev
```

La API debe estar corriendo en `http://localhost:3001/api`

### 2. **Iniciar el Frontend**

```bash
cd /Users/jesusortiz/Documents/trae_projects/valet-parking-system

# Instalar dependencias si no lo has hecho
npm install

# Iniciar en modo desarrollo
npm run dev
```

El frontend debe estar corriendo en `http://localhost:3000`

### 3. **Probar Login**

**Usuarios de prueba** (creados por el seed):
- **Admin**: `admin@valetparking.com` / `admin123`
- **Attendant**: `attendant@valetparking.com` / `attendant123`
- **Client**: `client@valetparking.com` / `client123`

**Pasos:**
1. Ir a `/login/admin` o `/login/attendant`
2. Ingresar email y password
3. Verificar que se redirija al dashboard
4. Abrir DevTools → Application → Local Storage
5. Verificar que existe una clave `valet_parking_token` con el JWT

### 4. **Verificar Network Requests**

En Chrome DevTools → Network:
- Al hacer login: debe ver `POST /api/auth/login` con response `200`
- El token debe estar en el header `Authorization: Bearer ...` en requests subsecuentes

---

## 📊 Arquitectura de la Integración

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│                                                             │
│  ┌──────────────┐         ┌──────────────────────┐        │
│  │  Components  │────────▶│   Context Providers  │        │
│  │              │         │  - AuthProvider      │        │
│  │ - LoginForm  │         │  - StoreProvider     │        │
│  │ - Dashboard  │         └──────────┬───────────┘        │
│  │ - ...        │                    │                     │
│  └──────────────┘                    │                     │
│                                      │                     │
│                    ┌─────────────────▼─────────────┐      │
│                    │      API Services Layer        │      │
│                    │                                │      │
│                    │  - authService                 │      │
│                    │  - vehiclesService             │      │
│                    │  - paymentsService             │      │
│                    │  - settingsService             │      │
│                    │  - reportsService              │      │
│                    └─────────────┬──────────────────┘      │
│                                  │                         │
│                    ┌─────────────▼──────────────┐         │
│                    │     ApiClient (axios)       │         │
│                    │  - Interceptors             │         │
│                    │  - Token Management         │         │
│                    │  - Error Handling           │         │
│                    └─────────────┬───────────────┘         │
└──────────────────────────────────┼─────────────────────────┘
                                   │
                                   │ HTTP (JSON)
                                   │ JWT Token
                                   │
┌──────────────────────────────────▼─────────────────────────┐
│                    BACKEND (NestJS)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              API Endpoints (/api/*)                   │ │
│  │                                                       │ │
│  │  - /auth/login, /auth/me                            │ │
│  │  - /vehicles/*, /vehicles/register                  │ │
│  │  - /payments/*, /payments/methods                   │ │
│  │  - /settings/*, /settings/billing                   │ │
│  │  - /reports/revenue, /reports/summary               │ │
│  └───────────────────────┬──────────────────────────────┘ │
│                          │                                 │
│  ┌───────────────────────▼──────────────────────────────┐ │
│  │           Guards & Interceptors                       │ │
│  │  - JwtAuthGuard (validates tokens)                   │ │
│  │  - RolesGuard (RBAC)                                 │ │
│  └───────────────────────┬──────────────────────────────┘ │
│                          │                                 │
│  ┌───────────────────────▼──────────────────────────────┐ │
│  │              Business Logic Layer                     │ │
│  │  - AuthService, VehiclesService, etc.                │ │
│  └───────────────────────┬──────────────────────────────┘ │
│                          │                                 │
│  ┌───────────────────────▼──────────────────────────────┐ │
│  │              Prisma ORM                               │ │
│  └───────────────────────┬──────────────────────────────┘ │
└──────────────────────────┼─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                  PostgreSQL Database                    │
│                                                         │
│  Tables: users, vehicles, parking_records, payments,   │
│          payment_methods, settings                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Flujo de Autenticación

```
1. Usuario ingresa email/password
   │
   ▼
2. Frontend: authService.login({ email, password })
   │
   ▼
3. Backend: POST /api/auth/login
   │
   ├─ Valida credenciales con bcrypt
   ├─ Genera JWT token
   └─ Retorna { user, accessToken }
   │
   ▼
4. Frontend: Guarda token en localStorage
   │
   ▼
5. Frontend: Setea user en AuthContext
   │
   ▼
6. Requests subsecuentes:
   ApiClient agrega header: Authorization: Bearer {token}
   │
   ▼
7. Backend: JwtAuthGuard valida token
   │
   ├─ Si válido → continúa con request
   └─ Si inválido → 401 Unauthorized
       │
       ▼
       Frontend: Interceptor detecta 401
       │
       ├─ Limpia token
       └─ Redirige a /login
```

---

## 📝 Notas Importantes

### Diferencias entre Frontend y Backend

| Aspecto | Frontend (actual) | Backend (API) |
|---------|------------------|---------------|
| Roles | `"admin"`, `"attendant"` | `"ADMIN"`, `"ATTENDANT"`, `"CLIENT"` |
| Payment Types | `"zelle"`, `"mobile_payment"`, `"binance"` | `"ZELLE"`, `"MOBILE_PAYMENT"`, `"BINANCE"`, `"CASH"`, `"CARD"` |
| Billing Types | `"hourly"`, `"flat_rate"` | `"HOURLY"`, `"FLAT_RATE"` |
| Validation Types | `"manual"`, `"automatic"` | `"MANUAL"`, `"AUTOMATIC"` |
| Payment Status | `"pending"`, `"received"` | `"PENDING"`, `"RECEIVED"`, `"CANCELLED"` |
| Timestamps | `number` (Unix timestamp) | `string` (ISO date) |

**Solución implementada:** Mapeo automático en `lib/auth.tsx` (para roles) y en los servicios (para otros tipos).

### Migración de Datos

El frontend actual tiene datos en localStorage que NO se migrarán automáticamente a la API. Opciones:

1. **Empezar limpio** - Usuarios crean nuevos registros desde cero
2. **Script de migración** - Crear un script que lea localStorage y haga bulk inserts vía API
3. **Importación manual** - Los usuarios re-ingresan los datos importantes

---

## 🎯 Próximos Pasos

1. ✅ **Completados**: Servicios API, AuthProvider, configuración de entorno
2. 🚧 **En progreso**: Actualizar StoreProvider y componentes
3. 📋 **Pendiente**: Testing end-to-end, manejo de errores, UI/UX polish

---

## 🐛 Troubleshooting

### Error: "Network Error" o "ERR_CONNECTION_REFUSED"
- **Causa**: El backend no está corriendo
- **Solución**: `cd valet-parking-api && npm run start:dev`

### Error: 401 Unauthorized
- **Causa**: Token inválido o expirado
- **Solución**: Hacer logout y volver a hacer login

### Error: CORS Policy
- **Causa**: El backend no permite requests desde el frontend
- **Solución**: Verificar que `CORS_ORIGIN=http://localhost:3000` en `.env` del backend

### Los datos no se persisten
- **Causa**: El StoreProvider todavía usa localStorage
- **Solución**: Completar la migración del store (ver "Tareas Pendientes")

---

**Última actualización**: $(date)
**Estado**: Integración parcial completada - Autenticación funcional
