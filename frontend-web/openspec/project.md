# Project Context

## Purpose
TomTrade is a professional web-based trading platform that enables users to trade stocks with real-time data, portfolio management, and market analytics. The platform serves two user types:
- **User**: Regular traders who can view charts, manage portfolios, place orders, and track their trading history
- **System Admin**: Administrative users who manage users, view transaction/order logs, manage stocks, monitor risk, and handle system notifications

## Tech Stack
- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript
- **State Management**: Zustand (with persist middleware)
- **Data Fetching**: TanStack Query (via Apollo Client for GraphQL)
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion (via `motion` package)
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling**: Tailwind CSS 4 with custom theme variables
- **Charts**: Recharts
- **Date Handling**: date-fns

## Project Conventions

### Code Style
- **Naming**: camelCase for variables, functions, and file names
- **Components**: PascalCase for React component names
- **Files**: Component files use PascalCase (e.g., `UserDashboard.tsx`)
- **Hooks**: Prefix with `use` (e.g., `useAuthStore`)
- **Types**: PascalCase, interfaces preferred over type aliases for objects
- **Imports**: Use `@/` alias for absolute imports from project root

### Architecture Patterns
- **App Router**: Next.js 15 App Router with file-based routing
- **Layout Pattern**: `AppShell` wraps authenticated content with role-based sidebars
- **State Management**: Zustand stores in `lib/` directory with persist middleware
- **Component Organization**:
  - `components/ui/` - shadcn/ui base components
  - `components/layout/` - Layout components (AppShell, Sidebar, Topbar)
  - `components/user/` - User-specific components
  - `components/admin/` - Admin-specific components
  - `components/providers/` - Context providers (Auth, Apollo)
- **Role-Based Access**: RBAC implemented via `isAdmin()` check from auth store
- **GraphQL**: Apollo Client for backend API communication

### Testing Strategy
- Unit tests for utility functions and hooks
- Component tests for UI components
- E2E tests for critical user flows

### Git Workflow
- Feature branches from `main`
- Conventional commits preferred
- PR-based workflow with code review

## Domain Context
- **Trading Platform**: Users trade stocks/securities in real-time
- **Portfolio Management**: Users track holdings, P&L, and performance
- **Order Types**: Market orders, limit orders, GTC (Good Till Cancelled)
- **Risk Management**: System monitors and manages trading risk
- **Real-time Data**: WebSocket connections for live market data
- **Transaction Logs**: Complete audit trail of all transactions

## Important Constraints
- **Authentication Required**: Most features require authenticated users
- **Role Separation**: Admin and User have distinct UI and permissions
- **Real-time Performance**: UI must handle frequent data updates efficiently
- **Accessibility**: shadcn/ui components provide baseline accessibility

## External Dependencies
- **Backend API**: NestJS GraphQL backend (see `backend/` directory)
- **Authentication**: JWT-based authentication with access tokens
- **WebSocket**: Real-time notifications and market data updates
- **Database**: PostgreSQL via Prisma ORM (backend)
