# Folder Structure

## Project Layout

```
Nebula-Delivery/
│
├── app/                              # Expo Router Screens
│   ├── _layout.tsx                   # Root layout with auth routing
│   ├── modal.tsx                     # Modal screen
│   │
│   ├── (auth)/                       # Authentication Flow
│   │   ├── _layout.tsx               # Auth stack layout
│   │   ├── login.tsx                 # Email input screen
│   │   └── verify-otp.tsx            # OTP verification
│   │
│   ├── (customer)/                   # Customer App
│   │   ├── _layout.tsx               # Customer layout
│   │   ├── (tabs)/                   # Bottom Tab Navigation
│   │   │   ├── _layout.tsx           # Tab configuration
│   │   │   ├── index.tsx             # Home / Restaurant list
│   │   │   ├── cart.tsx              # Shopping cart
│   │   │   ├── orders.tsx            # Order history
│   │   │   └── profile.tsx           # User profile
│   │   │
│   │   ├── restaurant/
│   │   │   └── [id].tsx              # Restaurant detail & menu
│   │   ├── dish/
│   │   │   └── [id].tsx              # Dish detail
│   │   ├── orders/
│   │   │   └── [id].tsx              # Order tracking
│   │   └── profile/
│   │       └── edit.tsx              # Edit profile
│   │
│   └── (admin)/                      # Admin Dashboard
│       ├── (tabs)/                   # Admin Tab Navigation
│       │   ├── _layout.tsx           # Tab configuration
│       │   ├── dashboard.tsx         # Overview & stats
│       │   ├── restaurants.tsx       # Restaurant management
│       │   ├── orders.tsx            # Order management
│       │   └── menu.tsx              # Menu management
│       │
│       ├── restaurant/
│       │   └── create.tsx            # Create restaurant
│       ├── menu-item/
│       │   └── create.tsx            # Create menu item
│       └── orders/
│           └── [id].tsx              # Order detail
│
├── components/                       # Reusable Components
│   ├── auth/
│   │   ├── AuthGuard.tsx             # Role-based protection
│   │   └── OTPInput.tsx              # OTP input field
│   │
│   ├── admin/
│   │   ├── QuickActions.tsx          # Dashboard actions
│   │   └── StatsCard.tsx             # Statistics card
│   │
│   ├── ui/
│   │   ├── collapsible.tsx           # Collapsible panel
│   │   ├── icon-symbol.tsx           # Icon component
│   │   └── icon-symbol.ios.tsx       # iOS-specific icons
│   │
│   ├── LanguageSelector.tsx          # Language picker
│   ├── external-link.tsx             # External link handler
│   ├── haptic-tab.tsx                # Haptic feedback tab
│   ├── hello-wave.tsx                # Wave animation
│   ├── parallax-scroll-view.tsx      # Parallax scrolling
│   ├── themed-text.tsx               # Themed text
│   └── themed-view.tsx               # Themed view
│
├── lib/                              # Core Libraries
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client init
│   │   ├── auth.ts                   # Auth helpers
│   │   ├── storage.ts                # File upload helpers
│   │   └── test-connection.ts        # Connection test
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── useRestaurants.ts         # Restaurants data
│   │   ├── useMenu.ts                # Menu data
│   │   └── useOrders.ts              # Orders data
│   │
│   ├── validation/
│   │   ├── auth.ts                   # Auth schemas
│   │   ├── restaurant.ts             # Restaurant schemas
│   │   ├── menu.ts                   # Menu schemas
│   │   ├── order.ts                  # Order schemas
│   │   └── review.ts                 # Review schemas
│   │
│   └── i18n/
│       ├── index.ts                  # i18n configuration
│       └── locales/
│           ├── en.json               # English
│           ├── am.json               # Amharic
│           └── om.json               # Oromo
│
├── store/                            # State Management (Zustand)
│   ├── authStore.ts                  # Auth state
│   └── cartStore.ts                  # Cart state
│
├── types/                            # TypeScript Definitions
│   ├── database.ts                   # Database types
│   ├── models.ts                     # Domain models
│   ├── api.ts                        # API types
│   └── navigation.ts                 # Navigation types
│
├── constants/                        # App Constants
│   └── theme.ts                      # Theme colors
│
├── hooks/                            # Global Hooks
│   ├── use-color-scheme.ts           # Color scheme hook
│   ├── use-color-scheme.web.ts       # Web color scheme
│   └── use-theme-color.ts            # Theme color hook
│
├── assets/                           # Static Assets
│   ├── images/                       # App images
│   └── fonts/                        # Custom fonts
│
├── scripts/                          # Utility Scripts
│   └── reset-project.js              # Reset script
│
└── [Config Files]
    ├── .env                          # Environment variables
    ├── .gitignore                    # Git ignore rules
    ├── app.json                      # Expo configuration
    ├── package.json                  # Dependencies
    ├── tsconfig.json                 # TypeScript config
    └── eslint.config.js              # ESLint config
```

---

## Architecture Principles

### 1. Role-Based Routing

| Route Group | Purpose |
|-------------|---------|
| `(auth)` | Login & verification |
| `(customer)` | Customer app screens |
| `(admin)` | Admin dashboard |

### 2. Component Organization

| Folder | Contents |
|--------|----------|
| `components/auth/` | Auth-related components |
| `components/admin/` | Admin-specific components |
| `components/ui/` | Base UI primitives |

### 3. Data Flow

```
Supabase → lib/hooks/ → Zustand Store → Components
```

### 4. State Management

| Type | Solution |
|------|----------|
| Server State | React Query (via hooks) |
| Client State | Zustand stores |
| Local State | React useState |

### 5. Validation

All input validation uses Zod schemas in `lib/validation/`.

---

## Navigation Structure

```
Root Layout
│
├── Auth Stack (unauthenticated)
│   ├── Login
│   └── Verify OTP
│
├── Customer Stack (role: customer)
│   ├── Tabs
│   │   ├── Home
│   │   ├── Cart
│   │   ├── Orders
│   │   └── Profile
│   └── Modals
│       ├── Restaurant Detail
│       ├── Dish Detail
│       └── Order Detail
│
└── Admin Stack (role: admin)
    ├── Tabs
    │   ├── Dashboard
    │   ├── Restaurants
    │   ├── Orders
    │   └── Menu
    └── Forms
        ├── Create Restaurant
        └── Create Menu Item
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Screens | kebab-case | `verify-otp.tsx` |
| Components | PascalCase | `StatsCard.tsx` |
| Hooks | camelCase + use | `useAuth.ts` |
| Stores | camelCase + Store | `authStore.ts` |
| Types | camelCase | `database.ts` |

---

## Key Files

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout, auth check |
| `lib/supabase/client.ts` | Supabase initialization |
| `store/authStore.ts` | User session state |
| `store/cartStore.ts` | Shopping cart state |
| `constants/theme.ts` | App theme colors |
