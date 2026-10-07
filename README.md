# Atlas Travel mock

Fictional corporate travel-planning demonstration. It uses only simulated data and does not connect to booking, payment, or communication services.

## Requirements

- Node.js 20 or later
- npm 10 or later

## Run locally

Install dependencies, authenticate Codex, then start the frontend and the local assistant API in separate terminals:

```bash
npm install
npm run dev
```

```bash
uv sync
npm run dev:api
```

Next.js prints the local URL in the terminal, normally `http://localhost:3000`.

### Codex assistant setup

The assisted chat uses PydanticAI's `openai-codex` provider with your existing
ChatGPT/Codex subscription. Authenticate the Codex CLI once before starting the API:

```bash
codex login
```

The backend reads the CLI credentials from `~/.codex/auth.json` without writing to
that file. The model defaults to `gpt-6-luna`; set `CODEX_MODEL` only to override it:

```bash
export CODEX_MODEL=gpt-6-luna
```

No OpenAI API key is required for the Codex provider.

### Geographic setup

Copy `.env.example` to `.env` and set `GEOAPIFY_API_KEY` to enable real city lookup and MapLibre tiles. The key is sent to the map style at runtime, so restrict it to the local/demo origin in Geoapify. Geographic lookup is the only external integration; all travel options and confirmations remain fictional. CopilotKit telemetry is disabled by default for this local demo.

## Available commands

```bash
npm run dev    # Start the local development server
npm run build  # Type-check and create a production build
npm run lint   # Check source files with ESLint
npm test       # Exercise widgets, AG-UI decoding and the shared plan engine
npm run preview # Preview the production build locally
uv run pytest   # Run the local assistant API tests
```

## Project structure

- `src/components/`: reusable interface components
- `src/data/`: canonical fictional data for the demonstration
- `src/plan/`: shared in-session plan actions
- `src/styles/`: global and application-level styles
- `app/`: Next.js route, CopilotKit provider and local Copilot Runtime
- `src/App.tsx`: the client-side Atlas Travel workspace

### Conversational widgets

The browser connects to the local Copilot Runtime at `/api/copilotkit`; the runtime
forwards AG-UI requests to FastAPI/PydanticAI. The Atlas rail is a headless CopilotKit
chat that registers typed frontend tools, a GenUI status component, tool rendering and
human-in-the-loop decisions. Choosing dates, a flight, a stay, or simulated confirmation
automatically resumes the agent. The shared React plan is mirrored into agent state;
prices, policy and confirmation remain canonical local calculations. No CopilotKit
Intelligence, persistence or external AI service is configured.

Frontend component tests use Vitest, Testing Library and jsdom; backend AG-UI tests
use PydanticAI's local FunctionModel, so they do not require Codex credentials or network access.
