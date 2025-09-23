# SafariVerse Scripts

This directory contains utility scripts for managing SafariVerse data and development tasks.

## Available Scripts

### 🔥 Firebase Data Management

#### `npm run clear-firebase`

**File**: `clear-firebase-simple.js`

Quickly clears all Firebase Realtime Database data:

- `tunedInUsers` - Music stage users
- `socialHubUsers` - Social hub users
- `socialHubMessages` - Chat messages

**Usage**:

```bash
npm run clear-firebase
```

#### `npm run reset`

**File**: `complete-reset.js`

Complete reset tool that:

- Clears all Firebase data
- Provides browser data cleanup instructions
- Shows local storage keys to clear
- Gives step-by-step reset instructions

**Usage**:

```bash
npm run reset
```

## Firebase Collections

SafariVerse uses these Firebase Realtime Database collections:

| Collection          | Purpose                  | Data Type                       |
| ------------------- | ------------------------ | ------------------------------- |
| `tunedInUsers`      | Music stage active users | User profiles with country info |
| `socialHubUsers`    | Social hub active users  | User profiles with avatars      |
| `socialHubMessages` | Chat messages            | Message objects with timestamps |

## Local Storage Keys

Browser localStorage keys used by SafariVerse:

- `safariChatProfile` - User profile for chat
- `hbar_balance_*` - Cached HBAR balances
- `svtBalance` - Safari token balance
- Game scores and settings

## Manual Browser Cleanup

After running the scripts, manually clear browser data:

1. **Chrome/Edge**: F12 → Application → Storage → Clear site data
2. **Firefox**: F12 → Storage → Right-click localhost:3000 → Delete All
3. **Safari**: Cmd+Option+I → Storage → Clear Local/Session Storage

## Development Workflow

For a complete fresh start:

1. Run the reset script:

   ```bash
   npm run reset
   ```

2. Clear browser data (follow instructions from script output)

3. Restart development server:

   ```bash
   npm run dev
   ```

4. Visit http://localhost:3000 with fresh data

## Troubleshooting

**Script fails to run**:

- Check internet connection
- Verify Firebase configuration in `lib/firebase.ts`
- Ensure proper Firebase permissions

**Data still appears after clearing**:

- Clear browser cache and local storage manually
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check if data is cached elsewhere

**Firebase permission errors**:

- Verify you have admin access to the Firebase project
- Check Firebase security rules
- Ensure API keys are correct

## Adding New Scripts

To add new utility scripts:

1. Create the script in the `scripts/` directory
2. Use ES module syntax (`import`/`export`)
3. Add npm script to `package.json`
4. Update this README with documentation
5. Include error handling and user-friendly output
