import type { AssistantGenUiWidget } from '../components/assistantGenUiSchemas'

export type ToolCall = { id: string; type: 'function'; function: { name: string; arguments: string } }
export type ProtocolMessage = { id: string; role: 'user' | 'assistant' | 'tool'; content: string; toolCalls?: ToolCall[]; toolCallId?: string }
export type AssistantChatMessage = { id: string; role: 'user' | 'assistant'; content: string; widgets?: AssistantGenUiWidget[] }
export type Conversation = { threadId: string; protocol: ProtocolMessage[]; messages: AssistantChatMessage[] }
export const newId = () => crypto.randomUUID()
export const initialConversation = (): Conversation => ({ threadId: newId(), protocol: [], messages: [] })

export function visibleText(content: string): string {
  const marker = content.lastIndexOf('FINAL:')
  return marker < 0 ? '' : content.slice(marker + 6).trim()
}

export async function readAgUiStream(response: Response, onEvent: (event: Record<string, unknown>) => void) {
  if (!response.ok) throw new Error('The local assistant is unavailable. Start LM Studio and retry.')
  if (!response.body) throw new Error('The assistant returned an empty stream.')
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finished = false
  const consume = (frame: string) => {
    const data = frame.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n')
    if (!data || data === '[DONE]') return
    const event = JSON.parse(data) as Record<string, unknown>
    if (event.type === 'RUN_ERROR') throw new Error('The assistant could not finish. Your selections are saved; retry the response.')
    if (event.type === 'RUN_FINISHED') finished = true
    onEvent(event)
  }
  try {
    while (true) {
      const { value, done } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      let boundary: RegExpExecArray | null
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        consume(buffer.slice(0, boundary.index))
        buffer = buffer.slice(boundary.index + boundary[0].length)
      }
      if (done) break
    }
    if (buffer.trim()) consume(buffer)
    if (!finished) throw new Error('The assistant stream was interrupted. Retry to continue.')
  } finally {
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

export function toolResult(callId: string, result: unknown): ProtocolMessage {
  return { id: newId(), role: 'tool', toolCallId: callId, content: JSON.stringify(result) }
}
