# How to Run Nebula Delivery App

## Prerequisites

Before running the app, ensure you have the following installed:

1. **Node.js** (v18 or later recommended)
   - Download from: https://nodejs.org/

2. **npm** (comes with Node.js) or **yarn**

3. **Expo Go App** (for testing on physical device)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

4. **Android Studio** (optional, for Android emulator)
   - Download from: https://developer.android.com/studio

5. **Xcode** (optional, for iOS simulator - macOS only)

---

## Installation

### Step 1: Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

This will install all required packages.

---

## Running the App

### Option 1: Start Development Server (Recommended)

```bash
npm start
```

This will start the Expo development server. You'll see a QR code in the terminal.

- **On Physical Device:** Scan the QR code with:
  - **Android:** Expo Go app
  - **iOS:** Camera app (will redirect to Expo Go)

### Option 2: Run on Android

```bash
npm run android
```

This will:
- Start the development server
- Open the app on connected Android device or emulator

### Option 3: Run on iOS (macOS only)

```bash
npm run ios
```

This will:
- Start the development server
- Open the app on iOS simulator

### Option 4: Run on Web Browser

```bash
npm run web
```

This will open the app in your default web browser.

---

## Environment Variables

The app uses Supabase as the backend. Environment variables are already configured in the `.env` file:

- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

> **Note:** No changes needed unless you want to connect to a different Supabase project.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator (macOS only) |
| `npm run web` | Run in web browser |
| `npm run lint` | Check code for linting errors |

---

## Troubleshooting

### Common Issues

1. **"expo" is not recognized**
   ```bash
   npm install -g expo-cli
   ```

2. **Metro bundler stuck**
   - Press `r` in the terminal to reload
   - Or press `c` to clear cache and restart

3. **Dependencies issues**
   ```bash
   rm -rf node_modules
   npm install
   ```

4. **Cache issues**
   ```bash
   npx expo start --clear
   ```

5. **Android emulator not detected**
   - Make sure Android Studio is installed
   - Create an AVD (Android Virtual Device) in Android Studio
   - Start the emulator before running `npm run android`

---

## Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npm start

# 3. Scan QR code with Expo Go app on your phone
```

That's it! The app should now be running on your device.
