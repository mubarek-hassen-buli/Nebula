create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('customer', 'admin')) not null default 'customer',
  reward_points int default 0,
  preferred_language text default 'en',
  created_at timestamp with time zone default now()
);

create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  is_active boolean default true,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null,
  image_url text,
  is_available boolean default true
);

create table carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity int not null check (quantity > 0)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  restaurant_id uuid references restaurants(id),
  total_amount numeric(10,2),
  status text check (
    status in ('pending','scheduled','preparing','delivered','cancelled')
  ) default 'pending',
  scheduled_for timestamp with time zone, -- NULL = instant order
  reward_used boolean default false,
  created_at timestamp with time zone default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity int not null,
  price numeric(10,2) not null
);

create table reward_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  order_id uuid references orders(id),
  points_earned int,
  created_at timestamp with time zone default now()
);


create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  restaurant_id uuid references restaurants(id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamp with time zone default now()
);


insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', false);
