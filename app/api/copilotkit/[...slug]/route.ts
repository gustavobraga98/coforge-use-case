import { HttpAgent } from '@ag-ui/client'
import { CopilotRuntime, createCopilotRuntimeHandler } from '@copilotkit/runtime/v2'

// This fictional local demo does not send operational telemetry to CopilotKit.
process.env.COPILOTKIT_TELEMETRY_DISABLED ??= 'true'

const agentUrl = process.env.AGENT_URL ?? 'http://127.0.0.1:8000/api/assistant/ag-ui'
const copilotRuntime = new CopilotRuntime({
  agents: { atlas_travel: new HttpAgent({ url: agentUrl }) },
})
const handler = createCopilotRuntimeHandler({ runtime: copilotRuntime, basePath: '/api/copilotkit' })

export const runtime = 'nodejs'
export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
