# ClickDoc Medical Documentation Platform - Code Export

## Project Overview
A comprehensive medical documentation SaaS platform with role-based access, tier-based features, and Chrome extension integration for healthcare workflow automation.

### Features
- Multi-role authentication (Admin/User) with Replit OAuth
- Tier-based access control (Standard/Gold/Platinum memberships)
- Admin dashboard with user management and analytics
- User dashboard with key bindings and extension settings
- Medical-themed UI with responsive design
- PostgreSQL database integration
- Real-time activity logging and security monitoring

## File Structure

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── header.tsx     # Application header
│   │   │   ├── layout.tsx     # Main layout wrapper
│   │   │   ├── role-guard.tsx # Role-based access control
│   │   │   ├── sidebar.tsx    # Navigation sidebar
│   │   │   └── tier-guard.tsx # Tier-based feature gating
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts     # Authentication hook
│   │   │   └── use-toast.ts   # Toast notifications
│   │   ├── lib/               # Utility libraries
│   │   │   ├── authUtils.ts   # Authentication utilities
│   │   │   ├── queryClient.ts # React Query client
│   │   │   └── utils.ts       # General utilities
│   │   ├── pages/             # Application pages
│   │   │   ├── admin/         # Admin-specific pages
│   │   │   ├── landing.tsx    # Landing page
│   │   │   ├── user-dashboard.tsx
│   │   │   └── settings.tsx
│   │   ├── App.tsx           # Main application component
│   │   ├── main.tsx          # Application entry point
│   │   └── index.css         # Global styles
│   └── index.html            # HTML template
├── server/                    # Backend Express application
│   ├── db.ts                 # Database connection
│   ├── index.ts              # Server entry point
│   ├── replitAuth.ts         # Authentication setup
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Data access layer
│   └── vite.ts               # Vite integration
├── shared/                   # Shared types and schemas
│   └── schema.ts             # Database schema and types
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
└── drizzle.config.ts        # Database configuration
```

## Key Technologies
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth with OpenID Connect
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with medical theme
- **State Management**: React Query (TanStack Query)

## Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Replit environment (for authentication)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_session_secret
   REPLIT_DOMAINS=your_replit_domains
   REPL_ID=your_repl_id
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Core Tables
- **users**: User profiles with role and tier information
- **sessions**: Session storage for authentication
- **key_bindings**: Custom keyboard shortcuts for automation
- **extension_settings**: Chrome extension configuration
- **activity_logs**: User activity tracking
- **security_incidents**: Security monitoring and alerts

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - Logout user
- `GET /api/callback` - OAuth callback

### User Management (Admin)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Key Bindings
- `GET /api/key-bindings` - Get user key bindings
- `POST /api/key-bindings` - Create key binding
- `PUT /api/key-bindings/:id` - Update key binding
- `DELETE /api/key-bindings/:id` - Delete key binding

### Extension Settings
- `GET /api/extension-settings` - Get extension settings
- `POST /api/extension-settings` - Update extension settings

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/activity-logs` - User activity logs
- `GET /api/security-incidents` - Security incidents

## Role & Tier System

### Roles
- **Admin**: Full system access, user management, analytics
- **User**: Dashboard access, tools, settings

### Tiers
- **Standard**: Basic features, limited templates
- **Gold** ($49/mo): Advanced templates, priority support
- **Platinum** ($79/mo): Full customization, advanced analytics

## Security Features
- Session-based authentication with PostgreSQL storage
- Role-based access control (RBAC)
- Tier-based feature gating
- Activity logging and monitoring
- Security incident tracking
- CSRF protection and secure headers

## Medical Theme
- Teal color scheme (#0D9488)
- Medical terminology and iconography
- HIPAA-compliant design considerations
- Professional healthcare UI/UX patterns

## Chrome Extension Integration
- Key binding management for automated data entry
- Extension settings synchronization
- Real-time communication with web platform
- Medical template automation

This platform provides a complete foundation for medical documentation automation with enterprise-grade security and scalability.