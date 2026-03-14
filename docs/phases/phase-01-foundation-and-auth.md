# Phase 1: Foundation & Auth Infrastructure

> **Scope: MVP 1** | **Features: 5** | **Depends on: Nothing (base layer)**

## Goal

Set up the project foundation — authentication, **permission-based** access control, base layout, and HIPAA compliance primitives. After this phase, users can register, login, and see a role-appropriate dashboard shell.

> **Scalability principle**: The auth system is designed to support all 7 personas from day 1 (via the Role enum and permissions config), even though MVP 1 only activates 3 (Admin, Provider, Patient). Adding new personas in MVP 2 requires **zero code changes** to the middleware, route guards, or navigation — only a config update.

---

## Features (in build order)

### Feature 1.1: Project Scaffolding & Configuration

**Sequence: 1** | **Complexity: Low** | **Testable independently: Yes**

#### What to build
- Next.js App Router project structure with proper folder conventions
- Prisma schema initialization with base models (User, Role)
- Supabase project connection (auth + database)
- Tailwind CSS + shadcn/ui component library setup
- Environment variables configuration (.env)
- ESLint + Prettier configuration
- Base middleware setup for route protection

#### Database Models
```
User {
  id            String    @id @default(cuid())
  supabaseId    String    @unique    // Links to Supabase Auth
  email         String    @unique
  firstName     String
  lastName      String
  role          Role      @default(PATIENT)
  phone         String?
  avatarUrl     String?
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ALL roles defined upfront — MVP 1 only uses ADMIN, PROVIDER, PATIENT
// MVP 2 activates the rest WITHOUT any database migration for roles
enum Role {
  SUPER_ADMIN
  ADMIN
  PROVIDER
  NURSE
  CARE_COORDINATOR
  STAFF
  PATIENT
}
```

#### Key Files/Routes
```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (dashboard)/
│   ├── layout.tsx              // Protected layout with sidebar
│   ├── admin/                  // Admin + Super Admin pages
│   │   └── page.tsx
│   ├── clinical/               // Provider + Nurse pages (NOT "/provider")
│   │   └── page.tsx
│   ├── coordination/           // Care Coordinator pages (MVP 2)
│   │   └── page.tsx
│   ├── front-desk/             // Staff pages (MVP 2)
│   │   └── page.tsx
│   └── patient/
│       └── page.tsx
├── layout.tsx                  // Root layout
├── page.tsx                    // Landing/redirect
middleware.ts                   // Auth + permission-based route protection
lib/
├── auth/
│   ├── permissions.ts          // Permission definitions & role-permission map
│   ├── guards.ts               // requirePermission(), requireRole() helpers
│   └── route-access.ts         // Route-to-permission mapping (config, not code)
```

**Why `/clinical/` instead of `/provider/`?** Routes are grouped by **capability domain**, not persona. This way when Nurse arrives in MVP 2, they access the same `/clinical/*` routes with different permissions — no new route group needed.

#### How to Test
- [ ] Project runs locally without errors (`pnpm dev`)
- [ ] Database migrations apply cleanly (`prisma migrate dev`)
- [ ] All 7 Role enum values exist in the database
- [ ] Environment variables load correctly
- [ ] shadcn/ui components render properly

---

### Feature 1.2: Authentication (Supabase Auth)

**Sequence: 2** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Email/password registration with Supabase Auth
- Email/password login
- Password reset flow (forgot password → email → reset)
- Session management (JWT tokens via Supabase)
- Auth context/provider for client components
- Server-side session validation in API routes and server components
- Logout functionality

#### Implementation Details
- Use `@supabase/ssr` for server-side auth in Next.js App Router
- Create Supabase client utilities:
  - `lib/supabase/server.ts` — for Server Components & API routes
  - `lib/supabase/client.ts` — for Client Components
  - `lib/supabase/middleware.ts` — for middleware session refresh
- On registration: create Supabase Auth user → create Prisma User record (via webhook or post-signup)

#### How to Test
- [ ] Register a new account with email/password
- [ ] Receive confirmation email (if enabled) and verify
- [ ] Login with valid credentials → redirected to dashboard
- [ ] Login with invalid credentials → error message shown
- [ ] Forgot password sends reset email
- [ ] Password reset works end-to-end
- [ ] Logout clears session and redirects to login
- [ ] Refreshing page maintains session (no re-login needed)
- [ ] Accessing protected route while logged out → redirected to login

---

### Feature 1.3: Permission-Based Access Control (PBAC)

**Sequence: 3** | **Complexity: Medium** | **Testable independently: Yes**

> **This is the key scalability layer.** Instead of checking roles directly in middleware/components, we check **permissions**. Roles map to permission sets via a config file. Adding a new persona = adding one entry to the config.

#### What to build

**1. Permission definitions** (`lib/auth/permissions.ts`)
```typescript
// Granular permissions — each represents one capability
export const PERMISSIONS = {
  // System
  'system:configure':        'Manage system configuration',
  'audit:read':              'View audit logs',

  // Users
  'users:create':            'Create users (providers, staff, etc.)',
  'users:read':              'View user list',
  'users:update':            'Edit user profiles',
  'users:deactivate':        'Deactivate/reactivate users',

  // Patients
  'patients:read':           'View patient list and demographics',
  'patients:read_own':       'View own patient record',
  'patients:create':         'Register new patients',
  'patients:update':         'Edit patient records',
  'patients:update_own':     'Edit own profile',

  // Clinical
  'vitals:create':           'Record vitals',
  'vitals:read':             'View patient vitals',
  'diagnoses:manage':        'Create/update diagnoses',
  'notes:create':            'Create clinical notes',
  'notes:sign':              'Sign clinical notes',
  'documents:upload':        'Upload documents',
  'documents:read':          'View documents',

  // Appointments
  'appointments:create':     'Book appointments',
  'appointments:create_own': 'Book own appointments',
  'appointments:read':       'View all appointments',
  'appointments:read_own':   'View own appointments',
  'appointments:manage':     'Confirm, cancel, reschedule',
  'schedule:manage':         'Manage provider availability',

  // Video
  'video:conduct':           'Conduct video consultations',
  'video:join':              'Join video consultations',

  // Messaging
  'messages:send':           'Send messages',
  'messages:read':           'Read messages',
  'messages:broadcast':      'Send broadcast messages',

  // Care Plans (MVP 2)
  'careplans:create':        'Create care plans',
  'careplans:manage':        'Manage care plan activities',
  'careplans:read_own':      'View own care plans',
  'referrals:manage':        'Create and manage referrals',

  // Prescriptions (MVP 2)
  'prescriptions:create':    'Create prescriptions',
  'prescriptions:read_own':  'View own prescriptions',
  'refills:request':         'Request prescription refills',
  'refills:manage':          'Approve/deny refill requests',

  // Labs (MVP 2)
  'labs:order':              'Create lab orders',
  'labs:enter_results':      'Enter lab results',
  'labs:review':             'Review and release lab results',
  'labs:read_own':           'View own lab results',
  'lab_catalog:manage':      'Manage lab test catalog',

  // Billing (MVP 2)
  'billing_codes:manage':    'Manage billing codes and fee schedules',
  'invoices:create':         'Create and edit invoices',
  'invoices:read_own':       'View own invoices',
  'claims:manage':           'Submit and manage insurance claims',
  'payments:process':        'Process payments and refunds',
  'payments:make':           'Make payments',

  // Insurance (MVP 2)
  'insurance:verify':        'Run eligibility checks',
  'insurance:manage_own':    'Manage own insurance info',
  'payer_catalog:manage':    'Manage insurance payer catalog',

  // Consent (MVP 2)
  'consent_templates:manage':'Create/edit consent templates',
  'consent:sign':            'Sign consent forms',
  'consent:read':            'View consent records',

  // Workflows (MVP 2)
  'workflows:manage':        'Create and manage workflow templates',
  'workflows:assign':        'Assign workflows to patients',

  // Analytics (MVP 2)
  'analytics:view':          'View analytics dashboards',
  'analytics:view_own':      'View own performance metrics',

  // Settings
  'settings:manage_own':     'Manage own profile and preferences',
} as const;

export type Permission = keyof typeof PERMISSIONS;
```

**2. Role-to-permission mapping** (`lib/auth/role-permissions.ts`)
```typescript
import { type Permission } from './permissions';
import { type Role } from '@prisma/client';

// THE SINGLE SOURCE OF TRUTH for what each role can do.
// Adding a new role = adding one entry here. No other code changes needed.
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {

  SUPER_ADMIN: [
    'system:configure', 'audit:read',
    'users:create', 'users:read', 'users:update', 'users:deactivate',
    'patients:read', 'patients:create', 'patients:update',
    'vitals:read', 'diagnoses:manage', 'notes:create', 'notes:sign',
    'documents:upload', 'documents:read',
    'appointments:create', 'appointments:read', 'appointments:manage', 'schedule:manage',
    'messages:send', 'messages:read', 'messages:broadcast',
    'careplans:create', 'careplans:manage', 'referrals:manage',
    'prescriptions:create', 'refills:manage',
    'labs:order', 'labs:enter_results', 'labs:review', 'lab_catalog:manage',
    'billing_codes:manage', 'invoices:create', 'claims:manage', 'payments:process',
    'insurance:verify', 'payer_catalog:manage',
    'consent_templates:manage', 'consent:read',
    'workflows:manage', 'workflows:assign',
    'analytics:view',
    'settings:manage_own',
  ],

  ADMIN: [
    'audit:read',
    'users:create', 'users:read', 'users:update', 'users:deactivate',
    'patients:read', 'patients:create', 'patients:update',
    'documents:read',
    'appointments:read',
    'messages:send', 'messages:read',
    'lab_catalog:manage',
    'billing_codes:manage', 'invoices:create', 'claims:manage',
    'payer_catalog:manage',
    'consent_templates:manage', 'consent:read',
    'workflows:manage',
    'analytics:view',
    'settings:manage_own',
  ],

  PROVIDER: [
    'patients:read',
    'vitals:create', 'vitals:read',
    'diagnoses:manage',
    'notes:create', 'notes:sign',
    'documents:upload', 'documents:read',
    'appointments:create', 'appointments:read', 'appointments:manage', 'schedule:manage',
    'video:conduct',
    'messages:send', 'messages:read', 'messages:broadcast',
    'careplans:create', 'careplans:manage', 'referrals:manage',
    'prescriptions:create', 'refills:manage',
    'labs:order', 'labs:enter_results', 'labs:review',
    'insurance:verify',
    'analytics:view_own',
    'settings:manage_own',
  ],

  // --- MVP 2 roles (defined now, activated later) ---

  NURSE: [
    'patients:read',
    'vitals:create', 'vitals:read',
    'documents:upload', 'documents:read',
    'appointments:read',
    'labs:enter_results',
    'messages:send', 'messages:read',
    'settings:manage_own',
  ],

  CARE_COORDINATOR: [
    'patients:read',
    'vitals:read',
    'documents:read',
    'appointments:read',
    'careplans:create', 'careplans:manage', 'referrals:manage',
    'messages:send', 'messages:read',
    'workflows:assign',
    'settings:manage_own',
  ],

  STAFF: [
    'patients:read',
    'appointments:create', 'appointments:read', 'appointments:manage', 'schedule:manage',
    'invoices:create', 'claims:manage', 'payments:process',
    'insurance:verify',
    'messages:send', 'messages:read',
    'settings:manage_own',
  ],

  PATIENT: [
    'patients:read_own', 'patients:update_own',
    'appointments:create_own', 'appointments:read_own',
    'video:join',
    'messages:send', 'messages:read',
    'careplans:read_own',
    'prescriptions:read_own', 'refills:request',
    'labs:read_own',
    'invoices:read_own', 'payments:make',
    'insurance:manage_own',
    'consent:sign',
    'settings:manage_own',
  ],
};
```

**3. Guard utilities** (`lib/auth/guards.ts`)
```typescript
import { ROLE_PERMISSIONS } from './role-permissions';
import { type Permission } from './permissions';
import { type Role } from '@prisma/client';

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Check if a role has ANY of the listed permissions
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

// Check if a role has ALL of the listed permissions
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

// For API routes — throws 403 if permission check fails
export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Forbidden: missing permission "${permission}"`);
  }
}

// Get all permissions for a role (useful for client-side UI decisions)
export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
```

**4. Route-to-permission mapping** (`lib/auth/route-access.ts`)
```typescript
import { type Permission } from './permissions';

// Maps route patterns to required permissions.
// Middleware uses this to check access — no hardcoded role checks.
// Adding new routes for MVP 2 = adding entries here.
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  // Admin routes — require any admin-level permission
  '/admin':                ['users:read'],
  '/admin/users':          ['users:read'],
  '/admin/audit-logs':     ['audit:read'],
  '/admin/settings':       ['system:configure'],

  // Clinical routes — providers AND nurses can access
  '/clinical':             ['patients:read'],
  '/clinical/patients':    ['patients:read'],
  '/clinical/notes':       ['notes:create'],
  '/clinical/vitals':      ['vitals:create'],
  '/clinical/documents':   ['documents:read'],

  // Scheduling — providers, staff
  '/scheduling':           ['appointments:read'],
  '/scheduling/calendar':  ['appointments:read'],
  '/scheduling/manage':    ['schedule:manage'],

  // Patient routes
  '/patient':              ['patients:read_own'],
  '/patient/records':      ['patients:read_own'],
  '/patient/appointments': ['appointments:read_own'],

  // --- MVP 2 routes (defined now, no UI built yet) ---
  '/coordination':               ['careplans:create'],
  '/coordination/care-plans':    ['careplans:manage'],
  '/coordination/referrals':     ['referrals:manage'],
  '/front-desk':                 ['appointments:create'],
  '/front-desk/billing':         ['invoices:create'],
  '/front-desk/insurance':       ['insurance:verify'],
  '/prescriptions':              ['prescriptions:create'],
  '/labs':                       ['labs:order'],
  '/analytics':                  ['analytics:view'],
  '/workflows':                  ['workflows:manage'],
  '/consent':                    ['consent_templates:manage'],
};
```

**5. Middleware** (`middleware.ts`)
```typescript
// Middleware checks permissions, NEVER checks roles directly.
// This is why adding new roles doesn't require middleware changes.

import { ROUTE_PERMISSIONS } from '@/lib/auth/route-access';
import { hasAnyPermission } from '@/lib/auth/guards';

// In the middleware handler:
// 1. Get user session from Supabase
// 2. Fetch user.role from Prisma (or cache in session)
// 3. Find matching route in ROUTE_PERMISSIONS
// 4. Call hasAnyPermission(user.role, requiredPermissions)
// 5. If false → redirect to /403
```

**6. Navigation config** (`lib/config/navigation.ts`)
```typescript
import { type Permission } from '@/lib/auth/permissions';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredPermission: Permission;  // Sidebar shows/hides based on this
}

// Sidebar renders ONLY items where user has the required permission.
// Adding a new nav item for MVP 2 = adding an entry here.
export const NAV_ITEMS: NavItem[] = [
  // Admin section
  { label: 'Users',           href: '/admin/users',         icon: 'Users',     requiredPermission: 'users:read' },
  { label: 'Audit Logs',      href: '/admin/audit-logs',    icon: 'Shield',    requiredPermission: 'audit:read' },

  // Clinical section
  { label: 'Dashboard',       href: '/clinical',            icon: 'Layout',    requiredPermission: 'patients:read' },
  { label: 'Patients',        href: '/clinical/patients',   icon: 'Users',     requiredPermission: 'patients:read' },
  { label: 'Schedule',        href: '/scheduling/calendar', icon: 'Calendar',  requiredPermission: 'appointments:read' },
  { label: 'Clinical Notes',  href: '/clinical/notes',      icon: 'FileText',  requiredPermission: 'notes:create' },

  // Patient section
  { label: 'My Dashboard',    href: '/patient',             icon: 'Home',      requiredPermission: 'patients:read_own' },
  { label: 'Appointments',    href: '/patient/appointments', icon: 'Calendar', requiredPermission: 'appointments:read_own' },
  { label: 'My Records',      href: '/patient/records',     icon: 'FileText',  requiredPermission: 'patients:read_own' },
  { label: 'Messages',        href: '/patient/messages',    icon: 'MessageSquare', requiredPermission: 'messages:send' },

  // --- MVP 2 items (will auto-appear when role has permission) ---
  { label: 'Care Plans',      href: '/coordination/care-plans', icon: 'Heart',  requiredPermission: 'careplans:create' },
  { label: 'Referrals',       href: '/coordination/referrals',  icon: 'Send',   requiredPermission: 'referrals:manage' },
  { label: 'Billing',         href: '/front-desk/billing',      icon: 'DollarSign', requiredPermission: 'invoices:create' },
  { label: 'Insurance',       href: '/front-desk/insurance',    icon: 'Shield',     requiredPermission: 'insurance:verify' },
  { label: 'Prescriptions',   href: '/prescriptions',           icon: 'Pill',       requiredPermission: 'prescriptions:create' },
  { label: 'Lab Orders',      href: '/labs',                    icon: 'TestTube',   requiredPermission: 'labs:order' },
  { label: 'Analytics',       href: '/analytics',               icon: 'BarChart',   requiredPermission: 'analytics:view' },
  { label: 'Workflows',       href: '/workflows',               icon: 'Workflow',   requiredPermission: 'workflows:manage' },
];
```

#### How the Sidebar Renders (Conceptual)
```tsx
// components/layout/Sidebar.tsx
function Sidebar({ userRole }: { userRole: Role }) {
  const userPermissions = getPermissionsForRole(userRole);

  return (
    <nav>
      {NAV_ITEMS
        .filter(item => userPermissions.includes(item.requiredPermission))
        .map(item => (
          <NavLink key={item.href} href={item.href} icon={item.icon}>
            {item.label}
          </NavLink>
        ))}
    </nav>
  );
}
// A Nurse logging in sees: Dashboard, Patients, Schedule, Messages
// A Staff logging in sees: Schedule, Billing, Insurance, Messages
// No hardcoded role checks anywhere in the component.
```

#### Scalability Guarantee

When MVP 2 activates the Nurse role:
1. **Database**: No migration needed — `NURSE` already exists in the enum
2. **Middleware**: No change — it checks permissions, not roles
3. **Navigation**: No change — sidebar auto-shows items the Nurse has permission for
4. **API routes**: No change — they call `requirePermission('vitals:create')`, which Nurse already has
5. **Only new work**: Build the **UI pages** for Nurse-specific workflows (if any beyond what Provider already has)

#### How to Test
- [ ] Patient cannot access `/admin/*` or `/clinical/*` routes → gets 403 or redirect
- [ ] Provider can access `/clinical/*` but not `/admin/*`
- [ ] Admin can access `/admin/*` routes
- [ ] Sidebar shows only items the user has permission for
- [ ] API routes reject requests from users lacking the required permission
- [ ] Permission denied page (403) renders correctly
- [ ] `hasPermission('PROVIDER', 'notes:create')` returns `true`
- [ ] `hasPermission('PATIENT', 'notes:create')` returns `false`
- [ ] `hasPermission('NURSE', 'vitals:create')` returns `true` (even if Nurse UI not built yet)

---

### Feature 1.4: Base Layout & Navigation

**Sequence: 4** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Responsive sidebar layout for dashboard (collapsible on mobile)
- Top navbar with user profile dropdown (name, avatar, role badge, logout)
- **Permission-driven sidebar navigation** (renders items based on user permissions, NOT hardcoded per role)
- Breadcrumb navigation
- Empty state dashboard pages (shells for active personas)
- Theme support (light/dark mode via Tailwind)

#### What each persona sees (auto-derived from permissions)

**Admin** sees:
- Users, Audit Logs, Settings

**Provider** sees:
- Dashboard, Patients, Schedule, Clinical Notes, Messages

**Patient** sees:
- My Dashboard, Appointments, My Records, Messages, Profile

*(MVP 2 personas will auto-see their nav items when activated — no sidebar code changes)*

#### Key Components
```
components/
├── layout/
│   ├── Sidebar.tsx             // Permission-driven, config-based
│   ├── TopNav.tsx
│   ├── Breadcrumbs.tsx
│   └── DashboardShell.tsx
├── auth/
│   ├── PermissionGate.tsx      // Conditional render based on permission
│   └── RequirePermission.tsx   // Redirect if missing permission
├── ui/                         // shadcn components
```

#### `PermissionGate` Component (for inline conditional rendering)
```tsx
// Usage: <PermissionGate permission="notes:create"><SignNoteButton /></PermissionGate>
function PermissionGate({
  permission,
  children,
  fallback = null
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();
  if (!hasPermission(user.role, permission)) return fallback;
  return children;
}
```

#### How to Test
- [ ] Login as Admin → see admin-appropriate sidebar nav (Users, Audit Logs)
- [ ] Login as Provider → see clinical sidebar nav (Dashboard, Patients, Schedule, Notes)
- [ ] Login as Patient → see patient sidebar nav (Dashboard, Appointments, Records, Messages)
- [ ] Sidebar collapses on mobile viewport
- [ ] Profile dropdown shows user info, role badge, and logout works
- [ ] Dark/light mode toggle works
- [ ] Breadcrumbs reflect current route
- [ ] `<PermissionGate>` correctly shows/hides elements

---

### Feature 1.5: HIPAA Compliance Foundations

**Sequence: 5** | **Complexity: Medium** | **Testable independently: Yes**

#### What to build
- Audit log system — track all data access and modifications
- Secure HTTP headers (CSP, HSTS, X-Frame-Options, etc.)
- Session timeout (auto-logout after inactivity)
- Rate limiting on auth endpoints
- Data encryption at rest (Supabase/Postgres handles this)
- Secure cookie configuration

#### Database Models
```
AuditLog {
  id          String    @id @default(cuid())
  userId      String?
  action      String    // CREATE, READ, UPDATE, DELETE
  entity      String    // e.g., "Patient", "Appointment"
  entityId    String?
  details     Json?     // Additional context
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
}
```

#### Implementation Details
- Create `lib/audit.ts` with `logAudit(userId, action, entity, entityId, details)` utility
- Integrate audit logging into Prisma middleware or use a wrapper
- Add security headers in `next.config.mjs` or middleware
- Session timeout: auto-logout after 15 minutes of inactivity (client-side timer)
- Rate limiting: use `upstash/ratelimit` or custom middleware for auth routes

#### How to Test
- [ ] Login action creates an audit log entry
- [ ] CRUD operations on any entity generate audit logs
- [ ] Admin can view audit logs (read-only list page at `/admin/audit-logs`)
- [ ] Session expires after 15 min inactivity → user is logged out
- [ ] Security headers present in HTTP responses (check with browser dev tools)
- [ ] Rapid login attempts are rate-limited (429 response)

---

## Phase 1 Completion Criteria

After Phase 1, the following end-to-end flow works:

1. User visits the app → sees login page
2. New user registers with email/password → account created with PATIENT role
3. User logs in → redirected to permission-appropriate dashboard
4. Dashboard shows **permission-driven** sidebar navigation (not hardcoded by role)
5. Accessing unauthorized routes is blocked (permission check, not role check)
6. All auth actions are audit-logged
7. Session times out after inactivity
8. Admin can view audit logs
9. All 7 roles exist in the database (only 3 active in MVP 1)
10. Permission system is tested for all 7 roles (even if UI not built yet)

## Database Schema at End of Phase 1

- `User` (id, supabaseId, email, firstName, lastName, role, phone, avatarUrl, isActive, lastLoginAt, timestamps)
- `AuditLog` (id, userId, action, entity, entityId, details, ipAddress, userAgent, createdAt)
- `Role` enum with 7 values: SUPER_ADMIN, ADMIN, PROVIDER, NURSE, CARE_COORDINATOR, STAFF, PATIENT

## Scalability Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    MIDDLEWARE                             │
│  route → ROUTE_PERMISSIONS[route] → required permissions │
│  user.role → ROLE_PERMISSIONS[role] → user permissions   │
│  hasAnyPermission(userPerms, requiredPerms) → allow/deny │
└─────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
    ┌──────────────┐ ┌──────────┐ ┌────────────────┐
    │  Sidebar Nav │ │ API Route│ │ UI Components  │
    │  (config-    │ │ Guards   │ │ (Permission-   │
    │   driven)    │ │ (perm-   │ │  Gate)         │
    │              │ │  based)  │ │                │
    └──────────────┘ └──────────┘ └────────────────┘

Adding a new role:
  1. Role already in enum ✓ (defined in Phase 1)
  2. Add permissions to ROLE_PERMISSIONS config ✓ (one entry)
  3. Routes auto-accessible ✓ (middleware reads config)
  4. Nav auto-renders ✓ (sidebar reads permissions)
  5. API auto-authorized ✓ (guards read permissions)
  6. Build new UI pages if needed
```
