# Nebula Delivery

A mobile food delivery application built with React Native (Expo) and Supabase.

## Overview

Nebula Delivery connects customers with local restaurants, offering features like scheduled orders, reward points, and multi-language support.

### Key Features

- **OTP Authentication** - Secure email-based login
- **Restaurant Browsing** - Search and filter restaurants
- **Order Management** - Instant or scheduled orders
- **Rewards System** - Earn points, redeem free meals
- **Multi-Language** - English, Amharic, Oromo support
- **Admin Dashboard** - Manage restaurants, menus, orders

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native (Expo) |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase OTP |
| State | Zustand + React Query |
| Validation | Zod |
| i18n | i18next |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Platform-specific
npm run android    # Android
npm run ios        # iOS (macOS only)
npm run web        # Web browser
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in browser |
| `npm run lint` | Check for linting errors |
| `npm run reset-project` | Reset to blank project |

## Project Structure

```
app/
├── (auth)/       # Login & OTP verification
├── (customer)/   # Customer screens & tabs
└── (admin)/      # Admin dashboard & management

components/       # Reusable UI components
lib/              # Supabase, hooks, validation
store/            # Zustand state management
types/            # TypeScript definitions
```

## User Roles

| Role | Access |
|------|--------|
| **Customer** | Browse, order, track, review, earn rewards |
| **Admin** | Manage restaurants, menus, orders |

## Documentation

- [How to Run](./HOW_TO_RUN.md) - Setup instructions
- [App Idea](./AppIdea.md) - Feature specifications
- [Admin Guide](./Admin.md) - Admin functionality
- [Database Schema](./sql.md) - SQL structure
- [Folder Structure](./folder-structure.md) - Project organization
- [Business Model](./BusinessModel.md) - Revenue & strategy

## Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## License

Private - All rights reserved.
