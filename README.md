# Farcaster Mini App Boilerplate

A minimal boilerplate for building Farcaster mini apps with authentication and wallet support.

## Features

- ✅ Farcaster authentication via minikit SDK
- ✅ Wallet authentication support
- ✅ NextAuth session management
- ✅ Supabase integration ready
- ✅ Clean, minimal UI with Tailwind CSS
- ✅ TypeScript support
- ✅ Development tools included

## Quick Start

1. Clone this repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   - Supabase credentials
   - NextAuth secret
   - Any other required keys

5. Run the development server:
   ```bash
   # Simple local development
   yarn dev:simple
   
   # With tunnel for mobile testing (may fail on restricted networks)
   yarn dev:tunnel
   
   # Default (auto-detects tunnel capability)
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
apps/emoji.today/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/          # Utility functions
│   └── auth.ts       # Authentication configuration
├── public/           # Static assets
└── package.json      # Dependencies
```

## Authentication Flow

1. User clicks "Sign in with Farcaster"
2. If in Farcaster app: Uses minikit SDK for authentication
3. If on web: Redirects to Farcaster app
4. Session is managed via NextAuth
5. User info accessible via `useSession()` hook

## Development

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run linter

## License

MIT