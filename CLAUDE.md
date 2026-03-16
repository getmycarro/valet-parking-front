# Valet Parking System

Next.js 16 App Router. Two roles: admin, attendant. Fully client-side (no backend), localStorage persistence. pnpm.

## Commands
- `pnpm dev` / `pnpm start` / `pnpm lint` / `next build`

## Structure
- `app/(root)/page.tsx` — landing (role selection)
- `app/login/{admin,attendant}/` — login pages
- `app/admin/` — dashboard, employees, billing, history
- `app/attendant/` — attendant dashboard
- `components/ui/` — shadcn/ui (New York), Tailwind v4, lucide-react
- `components/admin/` — sidebar, charts
- `components/shared/` — vehicle registration, QR scanner, dashboard views
- `lib/store.tsx` — global state (React Context + useReducer), key `valet_parking_state`
- `lib/auth.tsx` — role auth, key `valet_parking_auth`
- `lib/types.ts` — TypeScript types
- `lib/utils.ts` — `cn()` helper

## State (`useStore()`)
`registerCarManual()`, `registerCarQR()`, `deliverCar()`, `addEmployee()`, `removeEmployee()`, `addPaymentMethod()`, `updateBilling()`, `calculateAmount()`

## Auth (`useAuth()`)
Roles: `"admin" | "attendant"`. Provides `user`, `login()`, `logout()`.

## Data Models
- **Car**: check-in/out timestamps, QR data, owner info
- **Employee**: idNumber, name, photo
- **PaymentMethod**: zelle | mobile_payment | binance
- **Settings**: charging mode (`hourly` | `flat_rate`), tips
- **PaymentRecord**: links Car to PaymentMethod

## Key Details
- IDs: `uid()` (timestamp + random)
- Timestamps: `Date.now()` (ms)
- QR data: `{type:"valet_ticket", v:1, carId, plate, checkInAt}`
- Charging: `hourly` or `flat_rate`
- QR scanning: `html5-qrcode` (camera + file upload), component: `components/shared/qr-scanner.tsx`
- Vehicle registration: 3 methods — QR scan, ID card search (TODO: API), manual form
- Attendants can scan QR but not generate them
- `ignoreBuildErrors: true`, images unoptimized, `@/*` path alias
- Most components are `"use client"`
- Routing: admin has `AdminSidebar`; both roles share `VehiclesDashboardView`, `VehicleRegistrationForm`
