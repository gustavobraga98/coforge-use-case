import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { findTravelLocation, atlasTravelScenario, travelLocations, type Location } from '../data/tripScenario'
import { planSnapshot, planStage, type AssistantPlanState, type PlanAction } from '../plan/travelPlan'
import { newId, readAgUiStream, toolResult, visibleText, type Conversation, type ProtocolMessage, type ToolCall } from '../plan/agUiConversation'
import { frontendToolsForStage, parseWidget, type AssistantGenUiWidget } from './assistantGenUiSchemas'
import { AssistantGenUi } from './AssistantGenUi'
import { Badge, Button } from './ui'
import { formatDateRange, toIsoDate } from '../plan/dateFormat'

type Props = {
  plan: AssistantPlanState
  getPlan: () => AssistantPlanState
  dispatch: (action: PlanAction) => AssistantPlanState
  conversation: Conversation
  onConversationChange: (conversation: Conversation) => void
}

async function resolveLocation(city: string, signal: AbortSignal): Promise<Location> {
  const known = findTravelLocation(city)
  if (known) return known
  const response = await fetch('/api/locations/geocode', { method: 'POST', signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: city }) })
  const value = await response.json()
  if (!response.ok || value.status !== 'resolved' || typeof value.latitude !== 'number' || typeof value.longitude !== 'number') throw new Error(`Cannot resolve ${city}. Choose a demo city or provide a more specific location.`)
  return { city, country: value.country ?? '', timeZone: value.timeZone ?? 'UTC', latitude: value.latitude, longitude: value.longitude }
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    return <Fragment key={index}>{part}</Fragment>
  })
}

function AssistantMessageContent({ content }: { content: string }) {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean)
  if (lines.length === 0) return null
  const nodes: ReactNode[] = []
  let list: string[] = []
  const flushList = () => { if (list.length) { nodes.push(<ul key={`list-${nodes.length}`}>{list.map((item, index) => <li key={index}>{renderInline(item)}</li>)}</ul>); list = [] } }
  for (const line of lines) {
    if (/^[-*]\s+/.test(line)) list.push(line.replace(/^[-*]\s+/, ''))
    else { flushList(); nodes.push(<p key={`text-${nodes.length}`}>{renderInline(line)}</p>) }
  }
  flushList()
  return <>{nodes}</>
}

function inferredRoute(messages: readonly { role: string; content: string }[]) {
  const transcript = messages.filter((message) => message.role === 'user').map((message) => message.content).join(' ').toLocaleLowerCase()
  const cities = travelLocations.filter((city) => transcript.includes(city.toLocaleLowerCase()))
  if (cities.length < 2) return null
  const origin = findTravelLocation(cities[0]); const destination = findTravelLocation(cities[1])
  return origin && destination ? { origin, destination } : null
}

function inferredDates(messages: readonly { role: string; content: string }[]) {
  const transcript = messages.filter((message) => message.role === 'user').map((message) => message.content).join(' ')
  const matches = transcript.match(/\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\d{1,2}\s+de\s+[a-zçã]+(?:\s+de\s+\d{4})?|[a-z]+\s+\d{1,2}(?:,?\s+\d{4})?/gi) ?? []
  const dates = matches.map(toIsoDate).filter((value): value is string => value !== null)
  return dates.length >= 2 ? { departureDate: dates[0], returnDate: dates[1] } : null
}

function nextWidget(plan: AssistantPlanState, messages: readonly { role: string; content: string }[]): AssistantGenUiWidget | null {
  const stage = planStage(plan)
  if (stage === 'budget') return { id: newId(), name: 'show_budget_confirmation', args: { suggestedBudgetUsd: 3000 }, status: 'pending' }
  if (stage === 'route') {
    const route = inferredRoute(messages)
    return route ? { id: newId(), name: 'resolve_trip_context', args: { origin: route.origin.city, destination: route.destination.city }, status: 'pending' } : null
  }
  if (stage === 'dates') {
    const dates = inferredDates(messages)
    return dates ? { id: newId(), name: 'show_date_confirmation', args: dates, status: 'pending' } : null
  }
  if (stage === 'flights') return { id: newId(), name: 'show_trip_options', args: { kind: 'flights' }, status: 'pending' }
  if (stage === 'stays') return { id: newId(), name: 'show_trip_options', args: { kind: 'stays' }, status: 'pending' }
  if (stage === 'review') return { id: newId(), name: 'show_cost_and_review', args: {}, status: 'pending' }
  if (stage === 'confirmation') return { id: newId(), name: 'request_plan_confirmation', args: {}, status: 'pending', revision: plan.revision }
  return null
}

const widgetOrder: Record<AssistantGenUiWidget['name'], number> = { show_budget_confirmation: 0, resolve_trip_context: 1, show_date_confirmation: 2, show_trip_options: 3, show_cost_and_review: 4, request_plan_confirmation: 5, respond_to_user: 6 }

export function AssistantPanel({ plan, getPlan, dispatch, conversation, onConversationChange }: Props) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const locked = useRef(false)
  const controller = useRef<AbortController | null>(null)
  const current = useRef(conversation)
  const feed = useRef<HTMLDivElement>(null)
  useEffect(() => { current.current = conversation }, [conversation])
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => { feed.current?.scrollTo?.({ top: feed.current.scrollHeight }) }, [conversation.messages.length, busy])

  function publish(next: Conversation) { current.current = next; onConversationChange(next) }
  function updateWidget(id: string, update: Partial<AssistantGenUiWidget>) {
    publish({ ...current.current, messages: current.current.messages.map((message) => ({ ...message, widgets: message.widgets?.map((widget) => widget.id === id ? { ...widget, ...update } : widget) })) })
  }
  function complete(widget: AssistantGenUiWidget, result: unknown, label: string) {
    if (current.current.protocol.some((message) => message.role === 'tool' && message.toolCallId === widget.id)) return
    updateWidget(widget.id, { status: 'complete', result: label })
    const hasToolCall = current.current.protocol.some((message) => message.role === 'assistant' && message.toolCalls?.some((call) => call.id === widget.id))
    const protocol = hasToolCall
      ? [...current.current.protocol, toolResult(widget.id, result)]
      : [...current.current.protocol, { id: newId(), role: 'user' as const, content: JSON.stringify({ interfaceAction: true, widget: widget.name, result }) }]
    publish({ ...current.current, protocol })
  }

  async function run() {
    if (locked.current) return
    locked.current = true; setBusy(true); setError(null)
    const abort = new AbortController()
    controller.current = abort
    const timeout = setTimeout(() => abort.abort(), 120_000)
    try {
      for (let step = 0; step < 10; step++) {
        const base = current.current
        const calls = new Map<string, ToolCall>()
        let rawText = ''
        const messageId = newId()
        const stage = planStage(getPlan())
        const response = await fetch('/api/assistant/ag-ui', {
          method: 'POST', signal: abort.signal,
          headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
          body: JSON.stringify({ threadId: base.threadId, runId: newId(), messages: base.protocol, tools: frontendToolsForStage(stage), context: [], state: { ...planSnapshot(getPlan()), stage }, forwardedProps: {} }),
        })
        try {
          await readAgUiStream(response, (event) => {
            if (event.type === 'TEXT_MESSAGE_CONTENT' && typeof event.delta === 'string') {
              rawText += event.delta
              publish({ ...base, messages: [...base.messages, { id: messageId, role: 'assistant', content: visibleText(rawText) }] })
            }
            if (event.type === 'TOOL_CALL_START') {
              const id = String(event.toolCallId)
              calls.set(id, { id, type: 'function', function: { name: String(event.toolCallName), arguments: '' } })
            }
            if (event.type === 'TOOL_CALL_ARGS') {
              const call = calls.get(String(event.toolCallId))
              if (call && typeof event.delta === 'string') call.function.arguments += event.delta
            }
          })
        } catch (failure) { publish(base); throw failure }
        const widgets: AssistantGenUiWidget[] = []
        const invalidResults: ProtocolMessage[] = []
        for (const call of calls.values()) {
          try { widgets.push(parseWidget(call.id, call.function.name, call.function.arguments, stage)) }
          catch { invalidResults.push(toolResult(call.id, { error: 'Invalid tool arguments. Use the registered schema and retry.' })) }
        }
        widgets.sort((left, right) => widgetOrder[left.name] - widgetOrder[right.name])
        const content = visibleText(rawText)
        const fallback = nextWidget(getPlan(), [...base.messages, { role: 'assistant', content }])
        const hasAction = widgets.some((widget) => widget.name !== 'respond_to_user')
        // If the model chose a conversational reply while the browser already
        // knows the sole next decision, favor the deterministic widget. This
        // keeps a weak local tool call from stalling the planning journey.
        const effectiveWidgets = hasAction ? widgets : fallback ? [fallback] : widgets
        const snapshot = getPlan()
        const renderedWidgets = effectiveWidgets.map((widget) => ({
          ...widget,
          snapshot,
          ...(widget.name === 'request_plan_confirmation' ? { revision: snapshot.revision } : {}),
        }))
        for (const widget of widgets) {
          if (!renderedWidgets.some((rendered) => rendered.id === widget.id)) {
            invalidResults.push(toolResult(widget.id, { cancelled: true, reason: 'The browser advanced with its canonical next planning action.' }))
          }
        }
        publish({ ...base,
          protocol: [...base.protocol, { id: messageId, role: 'assistant', content, ...(calls.size ? { toolCalls: [...calls.values()] } : {}) }, ...invalidResults],
          // Widget results are the canonical response. Do not show free-form model
          // prose beside them, since a local model can invent a conflicting price.
          messages: [...base.messages, { id: messageId, role: 'assistant', content: effectiveWidgets.length ? '' : content, widgets: renderedWidgets }],
        })
        for (const widget of renderedWidgets) {
          try {
            if (widget.name === 'respond_to_user') {
              complete(widget, { delivered: true }, String(widget.args.message))
            } else if (widget.name === 'resolve_trip_context') {
              const [origin, destination] = await Promise.all([resolveLocation(String(widget.args.origin), abort.signal), resolveLocation(String(widget.args.destination), abort.signal)])
              const next = dispatch({ type: 'setRoute', route: { origin, destination } })
              complete(widget, { route: next.route }, `${origin.city} → ${destination.city}`)
            } else if (widget.name === 'show_date_confirmation') {
              dispatch({ type: 'requestDates' })
            }
          } catch (failure) {
            const message = failure instanceof Error ? failure.message : 'Planning action failed.'
            complete(widget, { error: message }, message)
          }
        }
        const pending = current.current.messages.flatMap((message) => message.widgets ?? []).some((widget) => widget.status === 'pending')
        if (pending || !calls.size || effectiveWidgets.some((widget) => widget.name === 'respond_to_user')) return
      }
      throw new Error('The assistant reached its action limit. Review the current plan and retry.')
    } catch (failure) {
      if (!abort.signal.aborted) setError(failure instanceof Error ? failure.message : 'The assistant is unavailable.')
      else setError('The response was interrupted. Your choices are saved; retry to continue.')
    } finally { clearTimeout(timeout); locked.current = false; setBusy(false) }
  }

  function act(widget: AssistantGenUiWidget, action: PlanAction | null) {
    if (locked.current) return
    const latest = current.current.messages.flatMap((message) => message.widgets ?? []).find((candidate) => candidate.id === widget.id)
    if (!latest || (widget.status === 'pending' && latest.status !== 'pending')) return
    try {
      const next = action ? dispatch(action) : getPlan()
      const label = action?.type === 'setBudget' ? `Budget set to US$${action.budgetUsd.toLocaleString('en-US')}.` : action?.type === 'confirmDates' ? `Dates confirmed: ${formatDateRange(next.period!.departureDate, next.period!.returnDate)}.` : action?.type === 'confirmSimulatedPlan' ? 'Simulated plan confirmed.' : action?.type === 'selectFlight' ? 'Flight selected.' : action?.type === 'selectHotel' ? 'Stay selected.' : action?.type === 'requestReview' ? 'Plan reviewed. Confirmation is ready.' : action?.type === 'backToOptions' ? 'Returned to options.' : 'Updated the simulated plan.'
      const result = { action: action?.type, ...planSnapshot(next) }
      if (latest.status === 'complete') {
        for (const pending of current.current.messages.flatMap((message) => message.widgets ?? [])) {
          if (pending.status === 'pending') complete(pending, { cancelled: true, reason: 'The human edited a previous choice.' }, 'Superseded by an updated choice.')
        }
        updateWidget(latest.id, { result: label, snapshot: next })
        const messageId = newId()
        publish({ ...current.current,
          protocol: [...current.current.protocol, { id: messageId, role: 'user', content: JSON.stringify({ interfaceAction: true, ...result }) }],
          messages: [...current.current.messages, { id: messageId, role: 'user', content: label }],
        })
      } else complete(latest, result, label)
      if (!current.current.messages.flatMap((message) => message.widgets ?? []).some((candidate) => candidate.status === 'pending')) void run()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to apply the selection.') }
  }

  function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!draft.trim() || locked.current) return
    // A new natural-language request supersedes pending widgets without claiming approval.
    for (const widget of current.current.messages.flatMap((message) => message.widgets ?? [])) {
      if (widget.status === 'pending') complete(widget, { cancelled: true, reason: 'The user sent a new message; no selection was confirmed.' }, 'Superseded by a new message.')
    }
    const message = { id: newId(), role: 'user' as const, content: draft.trim() }
    publish({ ...current.current, protocol: [...current.current.protocol, message], messages: [...current.current.messages, message] })
    setDraft(''); void run()
  }

  return <section className="assistant-panel" aria-labelledby="assistant-panel-heading">
    <div className="assistant-panel__heading"><div><h2 id="assistant-panel-heading">AI Assistant</h2><p>Plan fictional travel and choose each step together.</p></div><Badge>Simulated</Badge></div>
    <div ref={feed} className="assistant-conversation" aria-live="polite" aria-label="Assistant conversation">
      {conversation.messages.length === 0 && <div className="assistant-empty-state"><p>Describe your trip to get started.</p><button className="assistant-suggestion" onClick={() => setDraft(atlasTravelScenario.request.naturalLanguage)}>Use Gustavo&apos;s fictional demo request</button></div>}
      {conversation.messages.map((message) => <article key={message.id} className={`assistant-message assistant-message--${message.role === 'user' ? 'traveler' : 'assistant'}`}>
        <span className="assistant-message__author">{message.role === 'user' ? 'You' : 'Atlas Travel'}</span>
        {message.content && <AssistantMessageContent content={message.content} />}
        {message.widgets?.map((widget) => <AssistantGenUi key={widget.id} widget={widget} plan={plan} busy={busy} onAction={act} />)}
      </article>)}
    </div>
    {error && <div className="assistant-error" role="alert"><p>{error}</p><Button disabled={busy} onClick={() => void run()}>Retry assistant response</Button></div>}
    <form className="assistant-composer" onSubmit={submit}>
      <label htmlFor="assistant-request">Your message</label>
      <textarea id="assistant-request" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit() } }} placeholder="Where would you like to travel?" rows={3} disabled={busy} />
      <div className="assistant-composer__actions"><span role="status">{busy ? 'Organizing your request…' : 'Enter to send · Shift+Enter for a new line'}</span><Button type="submit" disabled={!draft.trim() || busy}>Send</Button></div>
    </form>
  </section>
}
