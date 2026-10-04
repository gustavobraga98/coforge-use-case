# Atlas Travel mock

Fictional corporate travel-planning demonstration. It uses only simulated data and does not connect to booking, payment, or communication services.

## Requirements

- Node.js 20 or later
- npm 10 or later

## Run locally

Install dependencies, then start the frontend and the local assistant API in separate terminals:

```bash
npm install
npm run dev
```

```bash
uv sync
npm run dev:api
```

Vite prints the local URL in the terminal, normally `http://localhost:5173`.

### Local assistant setup

The assisted chat uses a local LM Studio server only. In LM Studio, load
`qwen3.6-35b-a3b@q4_k_s` and start the server from the Developer tab. The default
OpenAI-compatible endpoint is `http://127.0.0.1:1234/v1`.

These optional environment variables configure the backend:

```bash
export LM_STUDIO_BASE_URL=http://127.0.0.1:1234/v1
export LM_STUDIO_MODEL=qwen3.6-35b-a3b@q4_k_s
```

`LM_STUDIO_API_KEY` is optional and is only needed if local authentication was enabled in LM Studio.

## Available commands

```bash
npm run dev    # Start the local development server
npm run build  # Type-check and create a production build
npm run lint   # Check source files with ESLint
npm run preview # Preview the production build locally
uv run pytest   # Run the local assistant API tests
```

## Project structure

- `src/components/`: reusable interface components
- `src/data/`: canonical fictional data for the demonstration
- `src/styles/`: global and application-level styles
- `src/App.tsx`: the single demonstration route
