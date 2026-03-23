# Valet Parking System — Contexto Técnico

Next.js 16 App Router, TypeScript, shadcn/ui (New York), Tailwind v4. Backend NestJS en `http://localhost:3001/api`. pnpm.

## Comandos
```bash
pnpm dev        # http://localhost:3000
pnpm build
pnpm lint
```
Var de entorno: `NEXT_PUBLIC_API_URL=http://localhost:3001/api` (en `.env.local`)

---

## Estructura de carpetas

```
app/
├── page.tsx                     # Landing: botones para ir a /login
├── login/page.tsx               # Login unificado (detecta rol y redirige)
├── admin/
│   ├── dashboard/               # Métricas y vehículos activos
│   ├── employees/               # CRUD de empleados (VALET, ATTENDANT)
│   ├── billing/                 # Configuración de cobro (hourly / flat_rate)
│   ├── payment-methods/         # Alta de métodos de pago
│   ├── companies/               # CRUD de empresas (solo super_admin)
│   ├── invoices/                # Facturas
│   └── users/                   # Gestión de usuarios (solo super_admin)
├── attendant/
│   ├── layout.tsx               # Layout sin AdminSidebar
│   └── dashboard/               # Vista reducida: registrar y entregar vehículos
└── parking/[id]/page.tsx        # Detalle de un registro de parking

components/
├── ui/                          # shadcn/ui generados + custom (ver lista abajo)
├── admin/
│   ├── admin-sidebar.tsx        # Sidebar de navegación (solo admin/manager)
│   ├── occupancy-chart.tsx      # Gráfica de ocupación
│   ├── recent-transactions.tsx  # Tabla de últimas transacciones
│   └── companies-selector-modal.tsx
├── shared/
│   ├── vehicles-dashboard-view.tsx   # Vista principal de vehículos (admin + attendant)
│   ├── vehicle-registration-form.tsx # Formulario manual de entrada
│   ├── vehicle-table.tsx             # Tabla de vehículos con acciones
│   ├── vehicle-filter-dialog.tsx
│   ├── notification-bell.tsx         # Icono con notificaciones en tiempo real
│   ├── settings-modal.tsx
│   ├── admin-page-header.tsx
│   ├── search-in-progress-banner.tsx
│   ├── login-page-layout.tsx
│   ├── form-field.tsx           # Wrapper de campo con label + error
│   ├── select-field.tsx
│   └── data-table.tsx
├── layouts/
│   └── admin-layout.tsx         # Layout con AdminSidebar
├── login-form.tsx
├── theme-provider.tsx
└── providers.tsx                # Monta AuthProvider + StoreProvider + NotificationsProvider

lib/
├── api-client.ts                # axios singleton con interceptors JWT
├── auth.tsx                     # useAuth() — AuthProvider con JWT real
├── store.tsx                    # useStore() — estado global con API
├── types.ts                     # Todos los tipos TypeScript
├── constants.ts
├── utils.ts                     # cn() helper
├── utils/
│   ├── errors.ts                # StoreError, AuthError, logError()
│   ├── ids.ts                   # uid()
│   ├── time.ts                  # helpers de timestamps
│   ├── payment.ts               # cálculo de montos
│   ├── qr.ts                    # encode/decode QR
│   └── validation.ts
├── hooks/
│   ├── use-vehicles.ts          # Hook de vehículos con filtros
│   ├── use-notifications.ts     # Polling de notificaciones
│   ├── use-client-notifications.ts
│   ├── use-debounce.ts
│   └── use-crud-modal.ts
├── context/
│   └── notifications-context.tsx
└── services/                    # Capa de acceso a API (todos los endpoints)
    ├── auth-service.ts
    ├── vehicles-service.ts
    ├── payments-service.ts
    ├── employees-service.ts
    ├── companies-service.ts
    ├── users-service.ts
    ├── notifications-service.ts
    └── requests-service.ts
```

---

## Tipos principales (`lib/types.ts`)

```ts
type Car = {
  id: string; plate: string; brand?; model?; color?;
  checkInAt: number;          // Unix ms
  checkOutAt?: number;        // undefined = todavía adentro
  checkInValetId?; checkOutValetId?;
  checkInValet?: ValetInfo; checkOutValet?: ValetInfo;
  ownerId?;
};

type Employee = {
  id: string; name: string; idNumber: string;
  type: 'VALET' | 'ATTENDANT';
  email?; photoUrl?;
};

type PaymentMethod = {
  id: string; type: PaymentMethodType; name: string; form: string; isActive: boolean;
};
type PaymentMethodType = "zelle" | "mobile_payment" | "binance" | "cash" | "card";

type PaymentRecord = {
  id: string; parkingRecordId: string; methodId: string;
  amountUSD: number; tip: number;
  date: number;               // Unix ms
  status: PaymentStatus;      // "pending" | "received" | "cancelled"
};

type AppNotification = {
  id: string; type: NotificationType | string;
  title: string; message: string;
  data: Record<string, unknown> | null;
  isRead: boolean; createdAt: string; // ISO
  company: { id: string; name: string };
  triggeredBy: NotificationUser | null;
  recipient: NotificationUser | null;
};
// NotificationType: 'CHECKOUT_REQUEST' | 'OBJECT_SEARCH_REQUEST' | 'APPROACH_COUNTER' | 'OBJECT_SEARCH_IN_PROGRESS'
```

**Nota sobre timestamps:** el frontend usa `number` (Unix ms), la API devuelve strings ISO. La conversión se hace en `mapParkingRecordToCar()` dentro de `store.tsx`.

---

## Estado global (`useStore()`)

React Context + useReducer. Los datos se cargan de la API al montar, no hay localStorage para datos de negocio.

```ts
const { state, isLoading, registerCarManual, deliverCar, addPaymentMethod,
        addPayment, updatePaymentStatus, addEmployee, removeEmployee } = useStore();

// state contiene:
// state.cars         — Car[]
// state.paymentMethods — PaymentMethod[]
// state.payments     — PaymentRecord[]
// state.employees    — Employee[]
```

| Acción | Descripción | API call |
|--------|-------------|----------|
| `registerCarManual(input)` | Registra entrada de vehículo | POST /api/vehicles/register |
| `deliverCar(id, valetId?, notes?)` | Marca checkout del vehículo | PATCH /api/vehicles/:id/checkout |
| `addPaymentMethod(method)` | Crea nuevo método de pago | POST /api/payments/methods |
| `addPayment(data)` | Registra pago de un parking | POST /api/payments |
| `updatePaymentStatus(id, status)` | Cambia estado del pago | PATCH /api/payments/:id/status |
| `addEmployee(data)` | Crea empleado | POST /api/employees |
| `removeEmployee(id, type)` | Elimina empleado | DELETE /api/employees/:id |

Todas las acciones lanzan el error si la API falla (usar `try/catch` en el componente).

`RegisterCarInput`:
```ts
{ plate, brand?, model?, color?, idNumber?, email?, name?, userId?, vehicleId?, valedId?, companyId? }
```

---

## Autenticación (`useAuth()`)

JWT real contra NestJS. El token se guarda en `localStorage` key `valet_parking_token` y se envía automáticamente en cada request vía interceptor axios.

```ts
const { user, login, logout, isLoading, updateUser, changePassword } = useAuth();

// user:
type User = {
  id: string; email: string; name: string;
  role: "super_admin" | "admin" | "manager" | "attendant";
  phone?; idNumber?; photoUrl?;
  companyUsers?: { company: { id: string; name: string } }[];
};

login(email, password)    // Promise<UserRole> — lanza error si credenciales inválidas
logout()                  // limpia token y estado
updateUser({ name?, idNumber? })
changePassword(currentPassword, newPassword)
```

**Mapeo de roles API → frontend:**
- `SUPER_ADMIN` → `super_admin`
- `ADMIN` → `admin`
- `MANAGER` → `manager`
- `ATTENDANT` → `attendant`

Al recibir 401, `api-client.ts` limpia el token y redirige a `/login`.

---

## Roles y permisos

| Capacidad | super_admin | admin | manager | attendant |
|-----------|:-----------:|:-----:|:-------:|:---------:|
| Ver dashboard métricas | — | ✓ | ✓ | — |
| Registrar vehículo | — | ✓ | ✓ | ✓ |
| Entregar vehículo | — | ✓ | ✓ | ✓ |
| Gestionar empleados | — | ✓ | ✓ | — |
| Configurar billing | — | ✓ | — | — |
| Gestionar empresas | ✓ | — | — | — |
| Gestionar usuarios globales | ✓ | — | — | — |
| AdminSidebar visible | — | ✓ | ✓ | — |

`super_admin` NO carga vehículos/pagos/empleados en el store (retorno temprano en `StoreProvider`).

---

## Capa de servicios (`lib/services/`)

Cada servicio usa `apiClient` (axios singleton). No llamar a `apiClient` directamente desde componentes.

```ts
// vehicles-service.ts
vehiclesService.registerManual(data)       // POST /api/vehicles/register
vehiclesService.checkout(id, data)         // PATCH /api/vehicles/:id/checkout
vehiclesService.searchByEmployee(idNumber) // GET /api/vehicles/search?idNumber=...
vehiclesService.getVehicles(page?, limit?) // GET /api/vehicles (paginado)
vehiclesService.getActive()                // GET /api/vehicles/active

// payments-service.ts
paymentsService.create(data)               // POST /api/payments
paymentsService.getMethods()               // GET /api/payments/methods
paymentsService.createMethod(data)         // POST /api/payments/methods
paymentsService.updateStatus(id, status)   // PATCH /api/payments/:id/status

// employees-service.ts
employeesService.getAll()
employeesService.create(data)
employeesService.delete(id, type)

// notifications-service.ts + requests-service.ts — notificaciones push y solicitudes cliente
```

El `api-client.ts` desenvuelve automáticamente el envelope `{ data: ... }` del backend (excepto si tiene `meta`).

---

## Patrones de código

### Nueva página (admin)

```tsx
// app/admin/nueva-seccion/page.tsx
"use client";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export default function NuevaSeccionPage() {
  const { state, isLoading } = useStore();
  const { user } = useAuth();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      {/* contenido */}
    </div>
  );
}
```

La página se monta dentro de `components/layouts/admin-layout.tsx` que ya provee el `AdminSidebar`.

### Nuevo componente con shadcn

```bash
pnpm dlx shadcn@latest add <nombre>
# Ejemplo: pnpm dlx shadcn@latest add combobox
```

Los componentes se instalan en `components/ui/`. Siempre importar desde `@/components/ui/<nombre>`.

### Manejo de estado con acción del store

```tsx
const { registerCarManual } = useStore();

async function handleSubmit(data: RegisterCarInput) {
  try {
    await registerCarManual(data);
    toast.success("Vehículo registrado");
  } catch (error) {
    toast.error("Error al registrar vehículo");
  }
}
```

### Proteger una ruta por rol

```tsx
const { user, isLoading } = useAuth();
if (isLoading) return null;
if (!user || user.role !== "admin") redirect("/login");
```

---

## Routing (App Router)

- Todo en `app/` con convención de carpetas.
- Layouts en `layout.tsx` (heredan hacia abajo).
- `app/admin/` usa `components/layouts/admin-layout.tsx` que renderiza `AdminSidebar`.
- `app/attendant/layout.tsx` es un layout propio sin sidebar.
- Rutas dinámicas: `app/parking/[id]/page.tsx` → param `id` via `params.id`.
- Alias de imports: `@/*` apunta a la raíz del proyecto.
- Casi todos los componentes son `"use client"` porque usan hooks.
- `next.config` tiene `ignoreBuildErrors: true` e imágenes sin optimizar.

---

## Estado de integración con backend

| Área | Estado |
|------|--------|
| Autenticación (login/me/logout) | Conectado a API |
| Vehículos (registro, checkout, lista) | Conectado a API |
| Métodos de pago | Conectado a API |
| Pagos (crear, actualizar estado) | Conectado a API |
| Empleados (listar, crear, eliminar) | Conectado a API |
| Notificaciones | Conectado a API (polling) |
| Empresas / Usuarios | Conectado a API |
| Reportes/Revenue | Servicio creado, integración en páginas pendiente |
| Settings/Billing | Servicio creado (`settings-service.ts` no está en services/ aún), UI en `app/admin/billing/` |

El store ya NO usa localStorage para datos de negocio. Solo el token JWT se guarda en `localStorage` (key `valet_parking_token`).

---

## Errores comunes y cómo evitarlos

**"useStore must be used within StoreProvider"**
El componente está fuera de `<StoreProvider>`. Verificar que el componente está bajo `components/providers.tsx` en el árbol.

**"useAuth must be used within AuthProvider"**
Igual que arriba, el componente debe estar bajo `<AuthProvider>`.

**401 en loop / redirect infinito**
Ocurre si el token expiró y el middleware redirige a `/login` pero el token no se limpió. `api-client.ts` llama a `clearToken()` automáticamente en 401.

**Datos no aparecen tras acción**
Las acciones del store hacen la llamada a API y luego dispatch al reducer local. Si la API falla, lanzan el error y el estado local NO se actualiza. Siempre envolver en try/catch.

**Tipos API vs frontend**
La API usa UPPERCASE para enums (`"PENDING"`, `"ZELLE"`, etc.). Los servicios hacen el mapeo. No pasar strings uppercase directamente al store — el reducer espera lowercase (`"pending"`, `"zelle"`).

**Componente shadcn no existe**
Verificar en `components/ui/` antes de instalarlo de nuevo. Los ya instalados incluyen: accordion, alert-dialog, alert, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, command, dialog, drawer, dropdown-menu, form, input, label, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, switch, table, tabs, textarea, toast, toggle, tooltip y varios custom (confirm-dialog, data-table, empty-state, field, loading-spinner, modal, page-header, search-input, stat-card, status-badge).
