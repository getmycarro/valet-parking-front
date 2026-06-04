# Front_getmycarro — Web Admin Dashboard

React + Vite admin UI for the GetMyCarro valet-parking platform.

## Stack

- React 18.3, Vite 5.4, React Router 6.26 — no TypeScript, all `.jsx`
- Firebase 12 — email/password auth (`signInWithEmailAndPassword`)
- Axios 1.16 — HTTP client with auth interceptors
- Plain CSS with custom properties (no Tailwind, no CSS-in-JS)
- No external component library — all UI is hand-built in `src/components/ui.jsx`

## Commands

```bash
npm install
npm run dev       # Vite dev server at http://localhost:5173 (auto-opens)
npm run build     # Production build → dist/
npm run preview   # Serve dist/ locally
```

No TypeScript, no test suite. Manual browser testing is the only verification.

## Environment variables

```
VITE_API_URL                       # Backend base URL (default: http://localhost:3001/api)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_CLOUDINARY_CLOUD_NAME         # dmsa4uyiq
VITE_CLOUDINARY_UPLOAD_PRESET      # gmc_payments
```

All `VITE_` vars are baked into the bundle at build time. Firebase keys are public SDK keys (not secrets).

## Auth flow

1. User submits email + password on `<LoginScreen />`
2. Firebase `signInWithEmailAndPassword()` → `fbUser.getIdToken()` → stored in `localStorage` as `gmc_token`
3. `GET /auth/me` fetches the backend user object (role, name, companyId, etc.)
4. Role controls which screens and sidebar items are visible

On 401 responses, the axios interceptor clears `gmc_token` and redirects to `/admin`.

## Roles and what each sees

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Companies, Users, all admin screens |
| `ADMIN` | Dashboard, Vehicles, Employees, Workdays, Payment Methods, Notifications, Reports |
| `MANAGER` | Dashboard, Vehicles, Notifications (read-only) |
| `ATTENDANT` | Separate minimal interface (`<AttendantDashboard />`) — no sidebar |

## Routing

```
/                   → <LandingPage />          (public marketing site)
/admin              → <AdminApp />             (auth + dashboard shell)
  /admin/vehicles   → <VehiclesScreen />
  /admin/employees  → <EmployeesScreen />
  /admin/companies  → <CompaniesScreen />      SUPER_ADMIN only
  /admin/users      → <UsersScreen />          SUPER_ADMIN only
  /admin/attendant  → <AttendantDashboard />   ATTENDANT only
  /admin/ticket/:id → <TicketDetailScreen />
  /admin/workdays   → <WorkdaysScreen />
  /admin/methods    → <PaymentMethodsScreen />
  /admin/notifications → <NotificationsScreen />
  /admin/reports    → <ReportsScreen />        (stub)
```

## File structure

```
src/
├── main.jsx              # React entry — BrowserRouter + <App />
├── App.jsx               # Route definitions (/ and /admin/*)
├── store.jsx             # VehicleStoreContext: STATUS_META, nextActions()
├── components/
│   ├── ui.jsx            # Full UI kit: Sidebar, Topbar, KpiCard, Modal, Toast, VehicleRow, etc.
│   └── icons.jsx         # ~40 Lucide-style SVG icons + <Logo />
├── hooks/
│   └── useTheme.js       # Dark/light theme toggle (persisted in localStorage + <html> class)
├── lib/
│   ├── api.js            # Axios instance with Bearer token interceptor
│   └── firebase.js       # Firebase app initialization
├── pages/
│   ├── LandingPage.jsx   # / — marketing site
│   └── AdminApp.jsx      # /admin/* — auth gate + role routing shell
├── screens/
│   ├── screens.jsx       # LoginScreen, DashboardScreen, VehiclesScreen, EmployeesScreen,
│   │                     # RegisterVehicleModal, PaymentModal, PaymentMethodsScreen, ReportsScreen
│   ├── role-screens.jsx  # CompaniesScreen, UsersScreen, AttendantDashboard
│   ├── TicketDetailScreen.jsx
│   ├── NotificationsScreen.jsx
│   └── WorkdaysScreen.jsx
└── styles/
    ├── tokens.css        # CSS custom properties: colors, typography, spacing
    ├── landing.css       # Landing page styles
    └── admin.css         # Admin shell styles
```

## API integration

**File:** `src/lib/api.js`

- Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:3001/api'`
- Request interceptor: reads `localStorage.getItem('gmc_token')`, adds `Authorization: Bearer <token>`
- Response interceptor: on 401 (non-auth routes), clears token + redirects to `/admin`
- All responses are wrapped in `{ data: ... }` by the backend — access via `res.data.data`

Key endpoints used:
```
POST /auth/login                            → login (not used — Firebase handles auth)
GET  /auth/me                               → fetch current user + role
GET  /vehicles                              → list with search/filter/pagination
POST /vehicles/register                     → check-in a vehicle
PATCH /vehicles/:id/status                  → update parking status
PATCH /vehicles/:id/checkout                → mark delivered
GET  /vehicles/:id                          → single vehicle detail
POST /payments                              → record a payment
PATCH /payments/:id/status                  → approve/reject payment
GET  /payments/methods                      → list payment methods
POST /payment-references/:parkingRecordId   → attach Cloudinary image URL to a record
GET  /workdays/active                       → current open shift
POST /workdays/open                         → open a new workday
PATCH /workdays/:id/close                   → close current workday
GET  /notifications                         → paginated notifications list
GET  /notifications/unread-count            → unread badge count
GET  /notifications/stream                  → SSE stream for live badge updates (token as query param)
PATCH /notifications/:id/read              → mark one as read
PATCH /notifications/read-all              → mark all as read
GET  /companies                             → list companies (SUPER_ADMIN)
GET  /users                                 → list users (SUPER_ADMIN)
GET  /employees                             → list valets/attendants
POST /employees                             → create employee
DELETE /employees/:id?type=VALET|ATTENDANT  → delete employee
```

## Cloudinary image upload

Used in `TicketDetailScreen.jsx` and `screens.jsx` (PaymentModal) to attach payment proof photos.

**Pattern (direct REST, no SDK):**
```js
const form = new FormData();
form.append('file', file);
form.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
const res = await fetch(
  `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
  { method: 'POST', body: form }
);
const { secure_url, public_id } = await res.json();
// Then POST secure_url to backend via /payment-references/:id or /payments
```

## Real-time notifications (SSE)

`NotificationsScreen.jsx` connects to `GET /notifications/stream` using `EventSource`. Because `EventSource` doesn't support headers, the JWT is passed as a query param: `?token=<gmc_token>`.

## Status workflow

```
ParkingRecordStatus:
  UNPAID              → "Sin pago"      (red)
  PAYMENT_UNDER_REVIEW → "En revisión"  (yellow)
  PAID                → "Pagado"        (amber)
  FREE                → "Entregado"     (green)

Next actions:
  UNPAID → register payment
  PAID   → deliver vehicle
  FREE   → terminal, no actions
```

`STATUS_META` and `nextActions()` are provided by `VehicleStoreContext` (from `store.jsx`) to avoid prop drilling across screens.

## Design tokens

Colors, typography, and spacing live in `src/styles/tokens.css` as CSS custom properties. Light/dark mode is toggled by adding/removing `dark` class on `<html>`. `useTheme.js` persists the preference in `localStorage`.

Font stack: Manrope (display), Inter (body), SF Mono (code/plates).

## Conventions

- Screens manage their own state with `useState` + `useEffect` — no global state manager.
- Data fetching uses cancellation flags (`let cancelled = false`) to avoid state updates after unmount.
- No TypeScript — use JSDoc comments for complex prop shapes if needed.
- All new screens should follow the existing pattern: `useEffect` on mount, loading state, error state, render list/form.
- New sidebar links: add an entry to the `groups` array in `AdminApp.jsx` with a `roles: [...]` filter.
- Keep UI components generic in `ui.jsx`; keep screen-specific logic in the screen files.
