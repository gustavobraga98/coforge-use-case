# Atlas Travel mock

Fictional corporate travel-planning demonstration. It uses only simulated data and does not connect to booking, payment, or communication services.

## Requirements

- Node.js 20 or later
- npm 10 or later

## Run locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Vite prints the local URL in the terminal, normally `http://localhost:5173`.

## Available commands

```bash
npm run dev    # Start the local development server
npm run build  # Type-check and create a production build
npm run lint   # Check source files with ESLint
npm run preview # Preview the production build locally
```

## Project structure

- `src/components/`: reusable interface components
- `src/data/`: canonical fictional data for the demonstration
- `src/styles/`: global and application-level styles
- `src/App.tsx`: the single demonstration route

