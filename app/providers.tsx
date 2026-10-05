'use client'

import { CopilotKit } from '@copilotkit/react-core/v2'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <CopilotKit runtimeUrl="/api/copilotkit" agent="atlas_travel" useSingleEndpoint={false}>{children}</CopilotKit>
}
