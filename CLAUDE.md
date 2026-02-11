# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Valet Parking System - A Next.js application for managing valet parking operations with two user roles: Administrators and Attendants.

## Development Commands

```bash
# Development server
pnpm dev

# Build for production
next build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture

### Application Structure

This is a Next.js 16 App Router application with a client-side state management pattern:

- **`app/`**: Next.js App Router pages
  - `app/(root)/page.tsx`: Landing page with role selection
  - `app/login/{admin,attendant}/`: Login pages for each role
  - `app/admin/`: Admin dashboard and pages (dashboard, employees, billing, history)
  - `app/attendant/`: Attendant dashboard
  - `app/layout.tsx`: Root layout with providers

- **`components/`**: React components organized by scope
  - `components/ui/`: Reusable UI components (shadcn/ui based)
  - `components/admin/`: Admin-specific components (sidebar, charts, active-vehicles)
  - `components/shared/`: Shared components used across roles (vehicle registration, dashboard views, QR scanner)

- **`lib/`**: Core application logic
  - `lib/store.tsx`: Global state management with React Context + useReducer
  - `lib/auth.tsx`: Authentication context (localStorage-based, no backend)
  - `lib/types.ts`: TypeScript type definitions
  - `lib/utils.ts`: Utility functions (cn for className merging)

### State Management

The application uses a centralized client-side store (`lib/store.tsx`) with:

- **Provider pattern**: `StoreProvider` wraps the app in `components/providers.tsx`
- **Reducer pattern**: All state mutations go through typed actions
- **localStorage persistence**: State automatically syncs to/from localStorage using the key `valet_parking_state`
- **Hook API**: `useStore()` provides methods like:
  - `registerCarManual()`: Register vehicle with full details
  - `registerCarQR()`: Register vehicle by scanning QR code
  - `deliverCar()`: Mark vehicle as checked out
  - `addEmployee()`, `removeEmployee()`: Manage employees
  - `addPaymentMethod()`: Add payment methods
  - `updateBilling()`: Update charging configuration
  - `calculateAmount()`: Calculate parking fee based on settings

### Authentication

Simple role-based auth in `lib/auth.tsx`:

- No backend authentication (localStorage only)
- Two roles: `"admin"` | `"attendant"`
- `useAuth()` hook provides: `user`, `login()`, `logout()`
- Auth state persists in localStorage with key `valet_parking_auth`

### Data Models

Key types from `lib/types.ts`:

- **Car**: Vehicle records with check-in/check-out timestamps, QR data, owner info
- **Employee**: Attendant records with idNumber (ID), name, photo
- **PaymentMethod**: Payment methods (zelle, mobile_payment, binance) with validation type
- **Settings**: System configuration for charging (por_hora vs tasa_fija) and tips
- **PaymentRecord**: Transaction records linking cars to payment methods

### UI Components

Built with shadcn/ui (New York style):

- Components configured in `components.json`
- Uses Tailwind CSS v4 with CSS variables for theming
- Icon library: lucide-react
- Path aliases configured: `@/*` maps to project root

### Routing

Two main user flows:

1. **Admin flow**: `/login/admin` → `/admin/dashboard` (+ employees, billing, history)
2. **Attendant flow**: `/login/attendant` → `/attendant/dashboard`

Both use the same shared components but with different UI layouts (admin has sidebar).

### Key Technical Details

- **Next.js Config**: TypeScript build errors ignored (`ignoreBuildErrors: true`), images unoptimized
- **TypeScript**: Strict mode enabled, path alias `@/*` configured
- **Package Manager**: pnpm (lock file present)
- **Client Components**: Most components are client-side (`"use client"`) due to state management needs
- **No Backend**: Fully client-side application with localStorage persistence

### Component Patterns

- Admin pages use `AdminSidebar` for navigation
- Vehicle management shared between roles via `VehiclesDashboardView` and `VehicleRegistrationForm`
- **Vehicle Registration**: Multi-modal registration system with three methods:
  - **QR Scanner**: Uses `html5-qrcode` library to scan QR codes from camera or file upload
  - **ID Card Search**: Placeholder for future integration with external service to fetch vehicle data by owner's ID
  - **Manual Form**: Traditional form input for vehicle details
- QR code scanning handled by `QRScanner` component in `components/shared/qr-scanner.tsx`
- Responsive design with sidebar toggle on mobile

## Important Notes

- The store generates unique IDs using `uid()` function (timestamp + random string)
- Payment calculations support both flat rate (`flat_rate`) and hourly (`hourly`) charging
- QR data structure: `{type: "valet_ticket", v: 1, carId, plate, checkInAt}`
- All timestamps use `Date.now()` (milliseconds since epoch)
- **QR Generation removed from attendant view** - Attendants can only scan QR codes, not generate them
- **ID Card Search**: Prepared for future integration - includes TODO comments for API integration

## Dependencies

### QR Code Scanning

- **html5-qrcode** (v2.3.8): Library for scanning QR codes via camera or file upload
  - Supports both camera scanning and image file upload
  - Works in modern browsers with camera permissions
