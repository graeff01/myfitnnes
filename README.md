# MyFit Tracker 💪

A premium, mobile-first Progressive Web App for tracking daily gym workouts with Apple Fitness-inspired visual design.

## Features

✨ **One-Tap Workout Logging** - Quick muscle group selection
🎯 **Activity Rings** - Visual consistency tracking (monthly, weekly, streak)
📊 **Multiple Views** - Today, Week, Month, and History
🎨 **Premium Design** - Apple Fitness-inspired dark theme
📱 **PWA Ready** - Install on home screen, works offline
⚡ **Fast & Lightweight** - Optimized for mobile performance

## Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS
- Framer Motion
- Vite PWA Plugin

**Backend:**
- Node.js + Express
- SQLite (better-sqlite3)

## Development

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install separately
npm install
cd client && npm install
cd ../server && npm install
```

### Running Locally

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3000
```

## Deployment to Railway

### Setup

1. Create a new project on Railway
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Add environment variable:
   - `NODE_ENV=production`

### Database

SQLite database will be created automatically on first run. For persistence, configure a Railway volume:
- Mount path: `/app/server/db`

## Project Structure

```
my-fit/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   └── App.jsx      # Main app
│   └── vite.config.js   # Vite + PWA config
├── server/              # Express backend
│   ├── db/              # Database files
│   ├── routes/          # API routes
│   └── server.js        # Express server
└── package.json         # Root scripts
```

## API Endpoints

- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Log a workout
- `GET /api/workouts/stats/weekly` - Weekly statistics
- `GET /api/workouts/stats/monthly` - Monthly statistics
- `GET /api/workouts/stats/streak` - Current streak
- `DELETE /api/workouts/:id` - Delete a workout

## PWA Installation

1. Open the app in a mobile browser (Safari on iOS, Chrome on Android)
2. Tap "Add to Home Screen"
3. The app will install and can be launched like a native app

## License

MIT
