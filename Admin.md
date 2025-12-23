# Admin Dashboard Guide

## Overview

The Admin Dashboard provides complete control over restaurants, menus, and orders. Admins can manage all platform content through an intuitive interface.

---

## Restaurant Management

### Restaurant List View

Each restaurant card displays:

| Element | Description |
|---------|-------------|
| Name | Restaurant name |
| Status | Open / Closed indicator |
| Edit | Modify restaurant details |
| Manage Dishes | Access menu management |
| Delete | Remove restaurant |
| Toggle | Switch availability |

### Restaurant Actions

#### Edit Restaurant

Admins can update:
- Name
- Description
- Image
- Operating hours

#### Open / Close Restaurant

Controls customer visibility:

```
is_open = true  → Customers can order
is_open = false → Restaurant hidden from customers
```

---

## Menu Management

### Accessing Menu

When admin taps **"Manage Dishes"**:
1. App navigates to dish management screen
2. `restaurant_id` is automatically passed
3. All dishes created belong to that restaurant

### Adding a Dish

| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| Description | Text | No |
| Price | Number | Yes |
| Image | File Upload | No |
| Category | Dropdown | Yes |

### Global Categories (MVP)

Categories are shared across all restaurants:

| Category |
|----------|
| Burgers |
| Pizza |
| Pasta |
| Chicken |
| Salads |
| Sides |
| Desserts |
| Drinks |

**Benefits:**
- Simpler setup
- Consistent user experience
- Easier to manage

---

## Database Design

### Categories Table (Global)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);
```

### Menu Items Table

```sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Restaurant Availability

```sql
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT TRUE;
```

---

## Navigation Flow

```
Admin Dashboard
└── Restaurants List
    └── Restaurant Card
        ├── Edit → Edit Restaurant Screen
        ├── Delete → Confirmation → Remove
        ├── Toggle → Open/Close Status
        └── Manage Dishes → Dish List
            ├── Add Dish → Create Form
            └── Edit Dish → Edit Form
```

---

## Permissions (RLS)

| Action | Admin | Customer |
|--------|-------|----------|
| View Restaurants | ✅ | ✅ |
| Create Restaurant | ✅ | ❌ |
| Edit Restaurant | ✅ | ❌ |
| Delete Restaurant | ✅ | ❌ |
| View Menu | ✅ | ✅ |
| Create Menu Item | ✅ | ❌ |
| Edit Menu Item | ✅ | ❌ |
| Delete Menu Item | ✅ | ❌ |

---

## Mental Model

```
Admin
└── Restaurant
    ├── Open / Close
    ├── Edit Details
    ├── Delete
    └── Manage Dishes
        └── Dish
            ├── Name
            ├── Description
            ├── Price
            ├── Image
            └── Category (Global)
```

---

## Summary

For MVP, categories are global and created once. Admins create restaurants, manage them from cards (edit, delete, open/close), and when tapping "Manage Dishes," every dish created automatically belongs to that restaurant using the global category list. This approach simplifies the UI, database, and admin flow while remaining scalable for future enhancements.
