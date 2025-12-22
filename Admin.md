1️⃣ Admin Behavior (Exactly As You Want)
Admin Dashboard → Restaurants List

Each restaurant card shows:

Restaurant name

Status: Open / Closed

Buttons:

✏️ Edit

🍽 Manage Dishes

❌ Delete

🔄 Toggle Available / Unavailable

✅ This is perfect UX for admin.

Restaurant Card Actions
🏪 Edit Restaurant

Admin can update:

Name

Description

Image

Open / close times

🔄 Open / Close Restaurant

This controls visibility to customers.

is_open = true → customers can order
is_open = false → restaurant hidden / closed

🍽 Manage Dishes (Important)

When admin taps Manage Dishes:

👉 The app already knows:

restaurant_id


So:

Admin does NOT select restaurant again

Every dish created automatically belongs to that restaurant

Add Dish Screen (Inside Restaurant)

Admin fills:

Dish name

Image

Price

Description

Category (dropdown → GLOBAL categories)

Clicks Save → Dish is created.

2️⃣ Key Change: GLOBAL Categories (MVP Choice)
What you want now:

Categories are same for all restaurants

Example:

Burgers

Pizza

Drinks

Desserts

✔ Easier
✔ Faster
✔ No per-restaurant setup

Old Way (❌ not MVP)
Restaurant → Categories → Meals

New MVP Way (✅ simple)
Global Categories → Meals → Restaurant

3️⃣ UPDATED DATABASE DESIGN (IMPORTANT)

We will remove restaurant_id from categories.

✅ Categories Table (GLOBAL)
drop table if exists categories cascade;

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);


✔ One-time setup
✔ No restaurant link

✅ Seed Categories (Once)
insert into categories (name)
values
  ('Burgers'),
  ('Pizza'),
  ('Pasta'),
  ('Chicken'),
  ('Salads'),
  ('Sides'),
  ('Desserts'),
  ('Drinks');

✅ Menu Items (UPDATED)
drop table if exists menu_items cascade;

create table menu_items (
  id uuid primary key default gen_random_uuid(),

  restaurant_id uuid not null
    references restaurants(id) on delete cascade,

  category_id uuid not null
    references categories(id),

  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,

  is_available boolean default true,
  created_at timestamp with time zone default now()
);


✔ Dish belongs to:

One restaurant

One global category

✅ Restaurants Table (Availability)

Make sure this exists:

alter table restaurants
add column if not exists is_open boolean default true;

4️⃣ How “Manage Dishes” Works (Logic)
Admin taps “Manage Dishes”

App navigates to:

/admin/restaurants/{restaurant_id}/dishes

When adding a dish:
insert into menu_items ({
  restaurant_id,
  category_id,
  name,
  price,
  image_url
})


🚫 No restaurant picker
✔ Clean UX

5️⃣ Category Dropdown Logic (Very Simple)
select * from categories;


Same categories for all restaurants.

6️⃣ RLS IMPACT (Good News)

Your existing RLS for menu_items still works.

Admins:

Create / edit / delete dishes

Customers:

Read only

No change needed.

🧠 Final Mental Model (REMEMBER THIS)
Admin
 └── Creates Restaurant
       ├── Open / Close
       ├── Edit
       ├── Delete
       └── Manage Dishes
             └── Dish
                  ├── Name
                  ├── Image
                  ├── Price
                  └── Category (GLOBAL)

✅ Final Summary (One Paragraph)

For MVP, categories are global and created once. Admin creates a restaurant, manages it from a card (edit, delete, open/close), and when tapping “Manage Dishes,” every dish created automatically belongs to that restaurant and uses a global category list. This simplifies the UI, database, and admin flow while remaining scalable later.