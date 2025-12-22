# 📁 Nebula Delivery - Folder Structure

## Root Directory Structure

```
Nebula-Delivery-v2/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication screens
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── login.tsx            # OTP login screen
│   │   └── verify-otp.tsx       # OTP verification screen
│   │
│   ├── (customer)/              # Customer app screens
│   │   ├── (tabs)/              # Bottom tab navigation
│   │   │   ├── _layout.tsx      # Tab layout
│   │   │   ├── home.tsx         # Restaurant list
│   │   │   ├── orders.tsx       # Order history & tracking
│   │   │   ├── rewards.tsx      # Rewards & points
│   │   │   └── profile.tsx      # Profile & settings
│   │   │
│   │   ├── restaurant/          # Restaurant screens
│   │   │   └── [id].tsx         # Restaurant detail & menu
│   │   │
│   │   ├── cart.tsx             # Shopping cart
│   │   ├── checkout.tsx         # Checkout & scheduling
│   │   ├── order-detail/        # Order tracking
│   │   │   └── [id].tsx         # Order detail screen
│   │   └── review/              # Review screens
│   │       └── [restaurantId].tsx
│   │
│   ├── (admin)/                 # Admin dashboard screens
│   │   ├── (tabs)/              # Admin tab navigation
│   │   │   ├── _layout.tsx      # Admin tab layout
│   │   │   ├── dashboard.tsx    # Admin overview
│   │   │   ├── restaurants.tsx  # Restaurant management
│   │   │   ├── orders.tsx       # Order management
│   │   │   └── menu.tsx         # Menu management
│   │   │
│   │   ├── restaurant/          # Restaurant CRUD
│   │   │   ├── create.tsx       # Create restaurant
│   │   │   └── edit/[id].tsx    # Edit restaurant
│   │   │
│   │   └── menu-item/           # Menu item CRUD
│   │       ├── create.tsx       # Create menu item
│   │       └── edit/[id].tsx    # Edit menu item
│   │
│   ├── _layout.tsx              # Root layout with role routing
│   └── +not-found.tsx           # 404 screen
│
├── components/                   # Reusable components
│   ├── auth/                    # Authentication components
│   │   ├── OTPInput.tsx         # OTP input field
│   │   └── AuthGuard.tsx        # Role-based guard
│   │
│   ├── customer/                # Customer-specific components
│   │   ├── RestaurantCard.tsx   # Restaurant card
│   │   ├── MenuItemCard.tsx     # Menu item card
│   │   ├── CartItem.tsx         # Cart item row
│   │   ├── OrderCard.tsx        # Order card
│   │   ├── OrderStatusBadge.tsx # Status badge
│   │   ├── ReviewCard.tsx       # Review display
│   │   ├── RatingStars.tsx      # Star rating component
│   │   └── DateTimePicker.tsx   # Schedule picker
│   │
│   ├── admin/                   # Admin-specific components
│   │   ├── RestaurantForm.tsx   # Restaurant form
│   │   ├── MenuItemForm.tsx     # Menu item form
│   │   ├── OrderTable.tsx       # Orders table
│   │   ├── StatusDropdown.tsx   # Status selector
│   │   └── StatsCard.tsx        # Dashboard stats
│   │
│   ├── shared/                  # Shared components
│   │   ├── Button.tsx           # Custom button
│   │   ├── Input.tsx            # Custom input
│   │   ├── Card.tsx             # Card container
│   │   ├── LoadingSpinner.tsx   # Loading indicator
│   │   ├── EmptyState.tsx       # Empty state
│   │   ├── ErrorBoundary.tsx    # Error boundary
│   │   └── ImageUpload.tsx      # Image upload
│   │
│   └── ui/                      # Base UI components
│       ├── button.tsx           # (existing)
│       ├── input.tsx            # (existing)
│       └── card.tsx             # (existing)
│
├── lib/                         # Core utilities & configs
│   ├── supabase/                # Supabase configuration
│   │   ├── client.ts            # Supabase client
│   │   ├── auth.ts              # Auth helpers
│   │   ├── storage.ts           # Storage helpers
│   │   └── types.ts             # Database types
│   │
│   ├── api/                     # API layer
│   │   ├── auth.ts              # Auth API
│   │   ├── restaurants.ts       # Restaurant API
│   │   ├── menu.ts              # Menu API
│   │   ├── cart.ts              # Cart API
│   │   ├── orders.ts            # Orders API
│   │   ├── rewards.ts           # Rewards API
│   │   └── reviews.ts           # Reviews API
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Auth hook
│   │   ├── useRestaurants.ts    # Restaurants hook
│   │   ├── useMenu.ts           # Menu hook
│   │   ├── useCart.ts           # Cart hook
│   │   ├── useOrders.ts         # Orders hook
│   │   ├── useRewards.ts        # Rewards hook
│   │   └── useReviews.ts        # Reviews hook
│   │
│   ├── validation/              # Zod schemas
│   │   ├── auth.ts              # Auth validation
│   │   ├── restaurant.ts        # Restaurant validation
│   │   ├── menu.ts              # Menu validation
│   │   ├── order.ts             # Order validation
│   │   └── review.ts            # Review validation
│   │
│   └── utils/                   # Utility functions
│       ├── formatters.ts        # Format helpers
│       ├── validators.ts        # Validation helpers
│       ├── constants.ts         # App constants
│       └── i18n.ts              # Internationalization
│
├── store/                       # Zustand state management
│   ├── authStore.ts             # Auth state
│   ├── cartStore.ts             # Cart state
│   ├── orderStore.ts            # Order state
│   └── appStore.ts              # Global app state
│
├── types/                       # TypeScript types
│   ├── database.ts              # Database types
│   ├── models.ts                # Domain models
│   ├── api.ts                   # API types
│   └── navigation.ts            # Navigation types
│
├── constants/                   # Constants
│   ├── Colors.ts                # (existing)
│   ├── config.ts                # App config
│   └── routes.ts                # Route constants
│
├── hooks/                       # Global hooks
│   ├── use-color-scheme.ts      # (existing)
│   ├── use-color-scheme.web.ts  # (existing)
│   └── use-theme-color.ts       # (existing)
│
├── assets/                      # Static assets
│   ├── images/                  # Images
│   ├── fonts/                   # Fonts
│   └── icons/                   # Icons
│
├── scripts/                     # Build scripts
│   └── reset-project.js         # (existing)
│
├── supabase/                    # Supabase files
│   ├── migrations/              # SQL migrations
│   │   └── 001_initial_schema.sql
│   └── seed.sql                 # Seed data
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore
├── app.json                     # Expo config
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── AppIdea.md                   # App documentation
├── sql.md                       # Database schema
└── README.md                    # Project readme
```

## Key Organizational Principles

### 1. **Feature-Based Organization**
- Customer and admin features are separated
- Each feature has its own screens, components, and logic

### 2. **Role-Based Routing**
- `(auth)` - Authentication flow
- `(customer)` - Customer app
- `(admin)` - Admin dashboard

### 3. **Component Hierarchy**
- `components/shared/` - Used by both customer and admin
- `components/customer/` - Customer-specific
- `components/admin/` - Admin-specific
- `components/ui/` - Base UI primitives

### 4. **API Layer**
- Centralized in `lib/api/`
- Each domain has its own API file
- Uses React Query for caching and state management

### 5. **State Management**
- Zustand stores for global state
- React Query for server state
- Local state for UI-only state

### 6. **Type Safety**
- Database types generated from Supabase
- Domain models in `types/models.ts`
- API types for request/response

### 7. **Validation**
- Zod schemas in `lib/validation/`
- Reusable across client and server

## Navigation Structure

```
Root
├── Auth Stack (not authenticated)
│   ├── Login
│   └── Verify OTP
│
├── Customer Stack (role: customer)
│   ├── Tabs
│   │   ├── Home (Restaurant List)
│   │   ├── Orders
│   │   ├── Rewards
│   │   └── Profile
│   ├── Restaurant Detail
│   ├── Cart
│   ├── Checkout
│   ├── Order Detail
│   └── Review
│
└── Admin Stack (role: admin)
    ├── Tabs
    │   ├── Dashboard
    │   ├── Restaurants
    │   ├── Orders
    │   └── Menu
    ├── Create/Edit Restaurant
    └── Create/Edit Menu Item
```

## File Naming Conventions

- **Screens**: `kebab-case.tsx` (e.g., `order-detail.tsx`)
- **Components**: `PascalCase.tsx` (e.g., `RestaurantCard.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- **Stores**: `camelCase.ts` with `Store` suffix (e.g., `authStore.ts`)
- **Types**: `camelCase.ts` (e.g., `database.ts`)
- **Utils**: `camelCase.ts` (e.g., `formatters.ts`)
