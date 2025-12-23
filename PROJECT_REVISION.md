# Nebula Delivery - Project Revision Guide

A comprehensive technical reference for reviewing the entire project's frontend, backend, and database architecture.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Authentication System](#3-authentication-system)
4. [Database Schema](#4-database-schema)
5. [Frontend Structure](#5-frontend-structure)
6. [State Management](#6-state-management)
7. [API Layer](#7-api-layer)
8. [User Flows](#8-user-flows)
9. [Business Logic](#9-business-logic)
10. [Security](#10-security)
11. [Localization](#11-localization)
12. [Testing Checklist](#12-testing-checklist)

---

## 1. Project Overview

### Description
Nebula Delivery is a mobile food delivery platform connecting customers with local restaurants.

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React Native (Expo) | Cross-platform mobile app |
| Backend | Supabase | PostgreSQL + Auth + Storage |
| State | Zustand | Client-side state management |
| Server State | React Query | Data fetching & caching |
| Validation | Zod | Schema validation |
| i18n | i18next | Multi-language support |
| Navigation | Expo Router | File-based routing |

### User Roles

| Role | Description |
|------|-------------|
| **Customer** | Browse, order, track, review, earn rewards |
| **Admin** | Manage restaurants, menus, orders |

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE APP                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Screens   │  │ Components  │  │    Hooks    │         │
│  │  (app/)     │  │(components/)│  │  (lib/hooks)│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────┐         │
│  │              STATE MANAGEMENT                  │         │
│  │  ┌─────────────┐       ┌─────────────┐        │         │
│  │  │   Zustand   │       │ React Query │        │         │
│  │  │ (authStore) │       │  (caching)  │        │         │
│  │  │ (cartStore) │       │             │        │         │
│  │  └──────┬──────┘       └──────┬──────┘        │         │
│  └─────────┼─────────────────────┼───────────────┘         │
│            └──────────┬──────────┘                          │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                      SUPABASE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Auth     │  │  Database   │  │   Storage   │        │
│  │   (OTP)     │  │ (PostgreSQL)│  │  (Images)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                          │                                 │
│                    ┌─────┴─────┐                           │
│                    │    RLS    │                           │
│                    │ (Security)│                           │
│                    └───────────┘                           │
└───────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → Hook → Supabase Client → Database
                ↓                      ↓
           Zustand Store         React Query Cache
                ↓                      ↓
              UI Update ←─────────────←┘
```

---

## 3. Authentication System

### OTP Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───▶│ Send OTP │───▶│  Verify  │───▶│  Route   │
│  Screen  │    │  (email) │    │   OTP    │    │ by Role  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                              ┌────────────────┬──────┘
                              ▼                ▼
                        ┌──────────┐    ┌──────────┐
                        │ Customer │    │  Admin   │
                        │   App    │    │Dashboard │
                        └──────────┘    └──────────┘
```

### Auth Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `sendOTP(email)` | `lib/supabase/auth.ts` | Send OTP to email |
| `verifyOTP(email, token)` | `lib/supabase/auth.ts` | Verify OTP code |
| `signOut()` | `lib/supabase/auth.ts` | Sign out user |
| `getUserProfile(userId)` | `lib/supabase/auth.ts` | Fetch profile data |
| `upsertProfile(userId, data)` | `lib/supabase/auth.ts` | Create/update profile |

### Auth Store (Zustand)

```typescript
interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize(): Promise<void>;
  signOut(): Promise<void>;
  refreshProfile(): Promise<void>;
}
```

### Session Lifecycle

| Event | Action |
|-------|--------|
| App Launch | `initialize()` → Check session → Fetch profile |
| Sign In | Store session → Fetch profile → Route by role |
| Sign Out | Clear session → Clear profile → Route to login |
| Token Refresh | Update session automatically |

---

## 4. Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  profiles   │       │ restaurants │       │ categories  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)     │
│ full_name   │  │    │ name        │       │ name        │
│ role        │  │    │ description │       └──────┬──────┘
│ reward_pts  │  │    │ image_url   │              │
│ language    │  │    │ is_active   │              │
│ avatar_url  │  │    │ created_by  │──┘           │
└──────┬──────┘  │    └──────┬──────┘              │
       │         │           │                      │
       │         │    ┌──────┴──────┐              │
       │         │    │             │              │
       │         │    ▼             │              │
       │         │  ┌─────────────┐ │              │
       │         │  │ menu_items  │ │              │
       │         │  ├─────────────┤ │              │
       │         │  │ id (PK)     │ │              │
       │         │  │ restaurant_id├─┘             │
       │         │  │ category_id │────────────────┘
       │         │  │ name        │
       │         │  │ price       │
       │         │  │ is_available│
       │         │  └──────┬──────┘
       │         │         │
       ▼         │         ▼
┌─────────────┐  │  ┌─────────────┐
│   orders    │  │  │ order_items │
├─────────────┤  │  ├─────────────┤
│ id (PK)     │  │  │ id (PK)     │
│ user_id     │──┘  │ order_id    │──┐
│ restaurant_id│     │ menu_item_id│  │
│ total_amount│     │ quantity    │  │
│ status      │     │ price       │  │
│ scheduled_for│    └─────────────┘  │
│ reward_used │                      │
└──────┬──────┘◄─────────────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   reviews   │    │reward_trans │
├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │
│ user_id     │    │ user_id     │
│ restaurant_id│   │ order_id    │
│ rating      │    │ points      │
│ comment     │    └─────────────┘
└─────────────┘
```

### Tables Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User data | role, reward_points, language |
| `restaurants` | Restaurant listings | name, is_active, created_by |
| `categories` | Global food categories | name (unique) |
| `menu_items` | Food items | restaurant_id, category_id, price |
| `orders` | Customer orders | status, scheduled_for, reward_used |
| `order_items` | Items in each order | quantity, price at time |
| `reviews` | Restaurant reviews | rating (1-5), comment |
| `reward_transactions` | Points history | points_earned |

### Order Status Flow

```
pending → scheduled → preparing → delivered
    │         │           │
    └─────────┴───────────┴────→ cancelled
```

---

## 5. Frontend Structure

### Navigation Architecture

```
Root Layout (_layout.tsx)
│
├── Unauthenticated
│   └── (auth)/
│       ├── login.tsx          # Email input
│       └── verify-otp.tsx     # OTP verification
│
├── Customer (role: customer)
│   └── (customer)/
│       ├── (tabs)/
│       │   ├── index.tsx      # Home / Restaurants
│       │   ├── cart.tsx       # Shopping cart
│       │   ├── orders.tsx     # Order history
│       │   └── profile.tsx    # User profile
│       │
│       ├── restaurant/[id].tsx  # Restaurant detail
│       ├── dish/[id].tsx        # Dish detail
│       ├── orders/[id].tsx      # Order tracking
│       └── profile/edit.tsx     # Edit profile
│
└── Admin (role: admin)
    └── (admin)/
        ├── (tabs)/
        │   ├── dashboard.tsx    # Stats overview
        │   ├── restaurants.tsx  # Restaurant list
        │   ├── orders.tsx       # All orders
        │   └── menu.tsx         # Menu management
        │
        ├── restaurant/create.tsx  # Add restaurant
        ├── menu-item/create.tsx   # Add menu item
        └── orders/[id].tsx        # Order detail
```

### Component Categories

| Category | Location | Examples |
|----------|----------|----------|
| Auth | `components/auth/` | AuthGuard, OTPInput |
| Admin | `components/admin/` | StatsCard, QuickActions |
| UI | `components/ui/` | Collapsible, IconSymbol |
| Shared | `components/` | LanguageSelector, ThemedText |

### Screen Responsibilities

| Screen | Role | Purpose |
|--------|------|---------|
| `login.tsx` | Both | Enter email for OTP |
| `verify-otp.tsx` | Both | Enter OTP code |
| `(customer)/index.tsx` | Customer | Browse restaurants |
| `(customer)/cart.tsx` | Customer | View/edit cart |
| `(admin)/dashboard.tsx` | Admin | View stats |
| `(admin)/restaurants.tsx` | Admin | Manage restaurants |

---

## 6. State Management

### Zustand Stores

#### Auth Store (`store/authStore.ts`)

```typescript
// State
session: Session | null
user: User | null
profile: Profile | null
isLoading: boolean
isInitialized: boolean

// Actions
initialize()      // Load session on app start
signOut()         // Clear all auth state
refreshProfile()  // Reload profile from DB
```

#### Cart Store (`store/cartStore.ts`)

```typescript
// State
items: CartItem[]
restaurantId: string | null  // Single restaurant constraint

// Actions
addItem(item)           // Add to cart
removeItem(itemId)      // Remove from cart
updateQuantity(id, delta)  // +/- quantity
clearCart()             // Empty cart
getTotalPrice()         // Calculate total
getItemCount()          // Count items
```

**Cart Rules:**
- Cart persisted to AsyncStorage
- Only items from ONE restaurant allowed
- Clearing last item resets restaurantId

### React Query Usage

| Hook | Query Key | Purpose |
|------|-----------|---------|
| `useRestaurants` | `['restaurants']` | Fetch all restaurants |
| `useOrders` | `['orders', restaurantId?]` | Fetch orders |
| `useMenu` | `['menu', restaurantId]` | Fetch menu items |

**Query Features:**
- Auto-caching
- Background refetching
- Optimistic updates on mutations
- Cache invalidation on success

---

## 7. API Layer

### Supabase Client

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);
```

### Data Hooks

#### useRestaurants

| Method | Type | Description |
|--------|------|-------------|
| `restaurants` | Query | All restaurants |
| `createRestaurant` | Mutation | Add new restaurant |
| `updateRestaurant` | Mutation | Edit restaurant |
| `toggleStatus` | Mutation | Activate/deactivate |
| `deleteRestaurant` | Mutation | Remove restaurant |

#### useOrders

| Method | Type | Description |
|--------|------|-------------|
| `orders` | Query | All/filtered orders |
| `getOrder(id)` | Function | Single order details |
| `updateStatus` | Mutation | Change order status |

#### useMenu

| Method | Type | Description |
|--------|------|-------------|
| `menuItems` | Query | Menu for restaurant |
| `categories` | Query | All categories |
| `createMenuItem` | Mutation | Add menu item |
| `updateMenuItem` | Mutation | Edit menu item |
| `deleteMenuItem` | Mutation | Remove menu item |

---

## 8. User Flows

### Customer: Place Order

```
1. Browse Restaurants
   └── Select restaurant → View menu

2. Add to Cart
   └── Select items → Set quantity → Add

3. Review Cart
   └── Adjust quantities → View total

4. Checkout
   ├── Choose: Order Now / Schedule
   ├── Apply rewards (optional)
   └── Confirm order

5. Track Order
   └── View status updates: pending → preparing → delivered
```

### Admin: Manage Restaurant

```
1. View Dashboard
   └── Stats: total restaurants, active orders

2. Restaurant List
   └── View all restaurants

3. Restaurant Actions
   ├── Edit → Update details
   ├── Toggle → Open/Close
   ├── Delete → Remove
   └── Manage Dishes → Menu screen

4. Menu Management
   ├── Add dish → Fill form → Save
   ├── Edit dish → Update → Save
   └── Toggle availability
```

### Admin: Process Order

```
1. View Orders
   └── Filter by status/restaurant/date

2. Select Order
   └── View customer, items, total

3. Update Status
   ├── pending → preparing
   ├── preparing → delivered
   └── any → cancelled
```

---

## 9. Business Logic

### Cart Constraints

| Rule | Implementation |
|------|----------------|
| Single restaurant | `restaurantId` field in cart store |
| Positive quantities | `Math.max(0, quantity + delta)` |
| Auto-clear restaurant | Reset `restaurantId` when empty |
| Persistence | AsyncStorage via Zustand persist |

### Order Rules

| Rule | Description |
|------|-------------|
| One restaurant per order | Cart enforces this |
| Scheduled orders | `scheduled_for` timestamp |
| No modification after preparing | Status check before edit |
| Rewards after delivery | Grant points only when delivered |

### Rewards Logic

```
On Order Delivered:
  1. Calculate points = fixed_rate * order_total
  2. Add to user's reward_points
  3. Create reward_transaction record

On Reward Redemption:
  1. Check points >= threshold
  2. Apply discount to order
  3. Deduct points from user
  4. Set order.reward_used = true
```

### Category System (Global)

```
Categories (seeded once):
- Burgers, Pizza, Pasta, Chicken
- Salads, Sides, Desserts, Drinks

Menu Item → belongs to ONE Category
Menu Item → belongs to ONE Restaurant
```

---

## 10. Security

### Row Level Security (RLS)

| Table | Customer Access | Admin Access |
|-------|-----------------|--------------|
| profiles | Own only | All (read) |
| restaurants | Read all | Full CRUD |
| categories | Read all | Read only |
| menu_items | Read all | Full CRUD |
| orders | Own only | All |
| reviews | Read all, create own | Read all |

### App-Level Security

| Layer | Implementation |
|-------|----------------|
| Route Protection | AuthGuard component |
| Role Routing | Check `profile.role` in layout |
| API Security | Supabase RLS policies |
| Token Handling | Automatic refresh by Supabase |

### Auth Guard Logic

```typescript
// If not authenticated → redirect to login
// If admin accessing customer routes → redirect
// If customer accessing admin routes → redirect
```

---

## 11. Localization

### Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `am` | Amharic |
| `om` | Oromo |

### i18n Configuration

```
lib/i18n/
├── index.ts           # i18next setup
└── locales/
    ├── en.json        # English translations
    ├── am.json        # Amharic translations
    └── om.json        # Oromo translations
```

### Usage

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
t('home.title')  // Returns translated string
```

### Language Persistence

```
User selects language
  → Update profile.preferred_language
  → i18n.changeLanguage()
  → App re-renders with new language
```

---

## 12. Testing Checklist

### Authentication

- [ ] Send OTP to valid email
- [ ] Verify correct OTP
- [ ] Reject incorrect OTP
- [ ] Route customer to customer app
- [ ] Route admin to admin dashboard
- [ ] Sign out clears all state
- [ ] Session persists after app restart

### Customer Flow

- [ ] View restaurant list
- [ ] Search/filter restaurants
- [ ] View restaurant menu
- [ ] Add item to cart
- [ ] Update cart quantity
- [ ] Remove item from cart
- [ ] Cart restricted to one restaurant
- [ ] Place instant order
- [ ] Schedule future order
- [ ] View order history
- [ ] Track order status
- [ ] Leave review after delivery
- [ ] View reward points
- [ ] Redeem rewards

### Admin Flow

- [ ] View dashboard stats
- [ ] Create restaurant
- [ ] Edit restaurant
- [ ] Toggle restaurant open/closed
- [ ] Delete restaurant
- [ ] Add menu item
- [ ] Edit menu item
- [ ] Toggle item availability
- [ ] Delete menu item
- [ ] View all orders
- [ ] Filter orders
- [ ] Update order status

### Edge Cases

- [ ] Empty states (no restaurants, no orders)
- [ ] Network errors handled
- [ ] Loading states displayed
- [ ] Invalid inputs rejected (Zod validation)
- [ ] Language switching works
- [ ] Cart persists after app close

---

## Quick Reference

### File Locations

| Purpose | Path |
|---------|------|
| Auth screens | `app/(auth)/` |
| Customer screens | `app/(customer)/` |
| Admin screens | `app/(admin)/` |
| Auth logic | `lib/supabase/auth.ts` |
| Data hooks | `lib/hooks/` |
| Validation | `lib/validation/` |
| State stores | `store/` |
| Types | `types/` |
| Translations | `lib/i18n/locales/` |

### Key Commands

```bash
npm start           # Start dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run in browser
npm run lint        # Check linting
```

### Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=<supabase_url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

---

## Summary

Nebula Delivery is a full-stack food delivery app with:

- **Frontend**: React Native (Expo) with file-based routing
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: Zustand (client) + React Query (server)
- **Security**: OTP auth + RLS policies
- **i18n**: 3 languages supported

The app supports two roles (Customer/Admin) with distinct flows and permissions, enforced at both the application and database levels.
