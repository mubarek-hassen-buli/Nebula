📱 Food Delivery App — Full Description & User Flow
1️⃣ App Overview

This is a mobile food delivery application built using React Native (Expo) with Supabase as the backend.

The app supports two roles only:

Customer

Admin

Authentication is handled using OTP-based login (email OTP).

The app allows customers to browse restaurants, order food (immediate or scheduled), earn reward points, and redeem free meals. Admins manage restaurants, menus, and orders through a dashboard.

2️⃣ Roles & Permissions
👤 Customer

Customers can:

Register and Login using OTP

Browse restaurants and menus

Add items to cart

Place orders (instant or scheduled)

Track order status

Earn reward points

Redeem points for free meals

Leave reviews & ratings

Change language preference

🛠 Admin

Admins can:

Access an admin dashboard

Add, edit, or deactivate restaurants

Create menu categories and items

Manage order statuses

View all customer orders

Manage availability of menu items

3️⃣ Authentication Flow (OTP-Based)
Customer / Admin Login

User opens the app

User enters email

Supabase sends OTP

User verifies OTP

App fetches user profile

Role is checked:

customer → customer app

admin → admin dashboard

Role is stored in the profiles table.

4️⃣ Customer App Flow (Detailed)
🏠 Home Screen

List of available restaurants

Search & filter options

Restaurant rating and status (open/closed)

🏪 Restaurant Page

Restaurant details

Menu categories (e.g., Burgers, Drinks, Desserts)

Menu items with:

Name

Description

Price

Availability

🛒 Cart Flow

User adds menu items to cart

Cart shows:

Selected items

Quantity

Subtotal

Cart is restricted to one restaurant

User can:

Update quantity

Remove items

📅 Order Scheduling

Before checkout, user can choose:

Order Now

Schedule for later

Select date & time

Scheduled orders are stored with a scheduled_for timestamp.

💳 Checkout

Order summary

Apply reward points (if eligible)

Confirm order

On success:

Order is created

Cart is cleared

📦 Order Tracking

Order status updates:

Pending

Scheduled

Preparing

Delivered

Cancelled

⭐ Reviews & Ratings

After delivery, customer can:

Rate restaurant (1–5)

Leave a review

🎁 Rewards System

Each completed order earns reward points

Points accumulate in the user profile

When points reach a predefined limit:

User can redeem one free meal

Reward usage is tracked per order

🌍 Language Support

User selects preferred language

Stored in profile

App content adapts based on preference

5️⃣ Admin Dashboard Flow
📊 Dashboard Home

Overview:

Total restaurants

Active orders

Recent orders

🏪 Restaurant Management

Admin can:

Add restaurant

Edit restaurant info

Activate / deactivate restaurants

📋 Menu Management

Create menu categories per restaurant

Add/edit/delete menu items

Set item availability

Update prices

📦 Order Management

View all orders

Filter by:

Status

Restaurant

Date

Update order status:

Preparing

Delivered

Cancelled

6️⃣ Order Rules (Important)

One order belongs to one restaurant

A cart cannot contain items from multiple restaurants

Scheduled orders cannot be modified after preparation starts

Rewards are granted only after successful delivery

7️⃣ Rewards Logic (High-Level)

Each completed order:

Earns fixed reward points

If user reaches reward threshold:

Can redeem a free meal

Free meal is tracked per order

Points reset or decrease after redemption

8️⃣ Security & Access Control
Database-Level Security

Supabase Row Level Security (RLS) ensures:

Customers access only their own data

Admins manage platform-wide data

Role checks are enforced in database policies

App-Level Security

Role-based navigation

Admin routes are inaccessible to customers

9️⃣ Technical Stack Summary

Frontend: React Native (Expo)

Backend: Supabase (PostgreSQL + Auth + RLS)

Authentication: OTP-based (Email or Phone)

Navigation: Role-based stacks

Localization: Language stored in user profile