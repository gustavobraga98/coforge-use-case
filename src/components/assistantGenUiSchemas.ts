import { z } from 'zod'
import type { AssistantPlanState, PlanStage } from '../plan/travelPlan'

export const widgetSchemas = {
  respond_to_user: z.object({ message: z.string().min(1) }),
  resolve_trip_context: z.object({ origin: z.string().min(1), destination: z.string().min(1) }),
  show_date_confirmation: z.object({ departureDate: z.string(), returnDate: z.string() }),
  show_trip_options: z.object({ kind: z.enum(['flights', 'stays']) }),
  show_cost_and_review: z.object({}),
  request_plan_confirmation: z.object({}),
} as const
export type WidgetName = keyof typeof widgetSchemas
export type AssistantGenUiWidget = {
  id: string
  name: WidgetName
  args: Record<string, unknown>
  status: 'pending' | 'complete' | 'error'
  result?: string
  revision?: number
  snapshot?: AssistantPlanState
}
const descriptions: Record<WidgetName, string> = {
  respond_to_user: 'Send a short conversational answer for a greeting, missing location, explanation, or a completed plan. Do not use this to ask for dates, options or confirmation: call their widget tool instead.',
  resolve_trip_context: 'Apply the supplied origin and destination to the shared simulated plan and map.',
  show_date_confirmation: 'Ask the human to choose full ISO departure and return dates in an editable calendar. Pass the original date strings, even when ambiguous. Wait for its result before showing options.',
  show_trip_options: 'Show canonical simulated flights or stays and wait for a human selection. Dates and route must already be resolved. Never invent prices or option IDs.',
  show_cost_and_review: 'Show costs and policy alerts calculated from the shared selections. No invented prices.',
  request_plan_confirmation: 'Open human review and wait for an explicit button click. Cannot confirm on behalf of the human; call only with eligible selected flight and stay.',
}
function tool(name: WidgetName, schema = widgetSchemas[name]) {
  return { name, description: descriptions[name], parameters: z.toJSONSchema(schema) }
}

/**
 * Local models are considerably more reliable when they have one decision to
 * make. The browser owns the state machine and exposes only that decision.
 */
export function frontendToolsForStage(stage: PlanStage) {
  const answer = tool('respond_to_user')
  if (stage === 'route') return [answer, tool('resolve_trip_context')]
  if (stage === 'dates') return [answer, tool('show_date_confirmation')]
  if (stage === 'flights') return [answer, tool('show_trip_options', z.object({ kind: z.literal('flights') }))]
  if (stage === 'stays') return [answer, tool('show_trip_options', z.object({ kind: z.literal('stays') }))]
  if (stage === 'review') return [answer, tool('show_cost_and_review')]
  if (stage === 'confirmation') return [answer, tool('request_plan_confirmation')]
  return [answer]
}

export function parseWidget(id: string, name: string, args: string, stage: PlanStage): AssistantGenUiWidget {
  if (!(name in widgetSchemas)) throw new Error(`Unsupported assistant tool: ${name}`)
  const key = name as WidgetName
  const data = widgetSchemas[key].parse(JSON.parse(args || '{}'))
  const allowed = frontendToolsForStage(stage).some((tool) => tool.name === key)
  if (!allowed) throw new Error(`Tool ${key} is not available during ${stage}.`)
  if (key === 'show_trip_options' && (data as z.infer<typeof widgetSchemas.show_trip_options>).kind !== (stage === 'flights' ? 'flights' : stage === 'stays' ? 'stays' : undefined)) throw new Error('Option type does not match the current plan stage.')
  return { id, name: key, args: data, status: 'pending' }
}
