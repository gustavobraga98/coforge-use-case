'use client'

import { Fragment, useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useAgent, useComponent, useCopilotKit, useFrontendTool, useHumanInTheLoop, useRenderTool, useRenderToolCall } from '@copilotkit/react-core/v2/headless'
import { z } from 'zod'
import { atlasTravelScenario, findTravelLocation, type Location } from '../data/tripScenario'
import { formatDateRange, toIsoDate } from '../plan/dateFormat'
import { periodSchema, planSnapshot, planStage, type AssistantPlanState, type PlanAction } from '../plan/travelPlan'
import { evaluateTraditionalFlightOptions } from './traditionalFlightFilters'
import { createTraditionalPlanSummary } from './traditionalPlanSummary'
import { TraditionalPlanCostSummary } from './TraditionalPlanCostSummary'
import { Badge, Button } from './ui'

type Props = { plan: AssistantPlanState; getPlan: () => AssistantPlanState; dispatch: (action: PlanAction) => AssistantPlanState }
const agentId = 'atlas_travel'
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function visibleContent(content: unknown) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.map((part) => typeof part === 'object' && part && 'text' in part ? String(part.text ?? '') : '').join('')
  return ''
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>
    return <Fragment key={index}>{part}</Fragment>
  })
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean)
  return <>{lines.map((line, index) => <p key={index}>{renderInline(line.replace(/^[-*]\s+/, ''))}</p>)}</>
}

function ensureStage(getPlan: () => AssistantPlanState, expected: ReturnType<typeof planStage>) {
  if (planStage(getPlan()) !== expected) throw new Error('That planning action is no longer available. Review the latest simulated plan.')
}

async function resolveLocation(city: string): Promise<Location> {
  const known = findTravelLocation(city)
  if (known) return known
  const response = await fetch('/api/locations/geocode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: city }) })
  const value = await response.json()
  if (!response.ok || value.status !== 'resolved' || typeof value.latitude !== 'number' || typeof value.longitude !== 'number') throw new Error('Choose a demo city or provide a more specific location.')
  return { city, country: value.country ?? '', timeZone: value.timeZone ?? 'UTC', latitude: value.latitude, longitude: value.longitude }
}

function CalendarDecision({ args, respond, plan, onApply }: { args: { departureDate: string; returnDate: string }; respond?: (value: unknown) => Promise<void>; plan: AssistantPlanState; onApply: (action: PlanAction) => unknown }) {
  const [departureDate, setDepartureDate] = useState(plan.period?.departureDate ?? toIsoDate(args.departureDate) ?? '')
  const [returnDate, setReturnDate] = useState(plan.period?.returnDate ?? toIsoDate(args.returnDate) ?? '')
  const period = periodSchema.safeParse({ departureDate, returnDate })
  return <section className="assistant-genui" aria-label="Confirm travel dates">
    <h3>Confirm travel dates</h3><p>Requested period: {formatDateRange(args.departureDate, args.returnDate)}. Review or approve the dates below.</p>
    <form onSubmit={(event) => { event.preventDefault(); if (period.success && respond) { const result = onApply({ type: 'confirmDates', period: period.data }); void respond({ ...result as object, datesConfirmed: true }) } }}>
      <div className="assistant-date-confirmation__fields">
        <label>Departure<input required type="date" value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} /></label>
        <label>Return<input required type="date" min={departureDate} value={returnDate} onChange={(event) => setReturnDate(event.target.value)} /></label>
      </div>
      {departureDate && returnDate && !period.success && <p role="alert">Return must be after departure.</p>}
      <Button type="submit" disabled={!respond || !period.success}>Apply these dates</Button>
    </form>
  </section>
}

function ChoiceDecision({ kind, respond, plan, onApply }: { kind: 'flights' | 'stays'; respond?: (value: unknown) => Promise<void>; plan: AssistantPlanState; onApply: (action: PlanAction) => unknown }) {
  if (!plan.scenario) return <section className="assistant-genui"><p>Confirm the route and dates to continue.</p></section>
  const scenario = plan.scenario
  const flights = kind === 'flights'
  return <section className="assistant-genui" aria-label={flights ? 'Compare simulated flights' : 'Compare simulated stays'}>
    <h3>{flights ? 'Compare flights' : 'Compare stays'}</h3><p>{scenario.request.route.origin.city} → {scenario.request.route.destination.city} · {formatDateRange(scenario.request.departureDate, scenario.request.returnDate)}</p>
    <ul className="assistant-options">
      {flights ? evaluateTraditionalFlightOptions(scenario, plan.filters).map(({ flight, isEligible, reasons }) => <li key={flight.id}>
        <strong>{flight.label} · {money(flight.roundTripPriceUsd)}</strong><p>{flight.cabin === 'economy' ? 'Economy' : 'Premium economy'} · {flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stops`} · {flight.outbound.durationMinutes} min</p>
        {reasons.map((reason) => <p key={reason}>{reason}</p>)}<Button disabled={!respond || !isEligible} onClick={() => { const result = onApply({ type: 'selectFlight', id: flight.id }); void respond?.(result) }}>Select flight</Button>
      </li>) : scenario.hotelOptions.map((hotel) => <li key={hotel.id}>
        <strong>{hotel.label} · {money(hotel.nightlyRateUsd * hotel.nights)}</strong><p>{hotel.locationSummary} · {hotel.comfort} · {hotel.nights} nights at {money(hotel.nightlyRateUsd)}</p>
        <Button disabled={!respond} onClick={() => { const result = onApply({ type: 'selectHotel', id: hotel.id }); void respond?.(result) }}>Select stay</Button>
      </li>)}
    </ul>
  </section>
}

function ReviewDecision({ respond, plan, onApply }: { respond?: (value: unknown) => Promise<void>; plan: AssistantPlanState; onApply: (action: PlanAction) => unknown }) {
  if (!plan.scenario) return null
  const summary = createTraditionalPlanSummary(plan.scenario, plan.selectedFlightId, plan.selectedHotelId)
  return <section className="assistant-genui" aria-label="Review simulated plan"><TraditionalPlanCostSummary scenario={plan.scenario} selectedFlightId={plan.selectedFlightId} selectedHotelId={plan.selectedHotelId} /><p>Review these fictional selections before enabling confirmation.</p><Button disabled={!respond || summary.state !== 'withinPolicy'} onClick={() => { const result = onApply({ type: 'requestReview' }); void respond?.(result) }}>Review simulated plan</Button></section>
}

function ConfirmationDecision({ respond, plan, onApply }: { respond?: (value: unknown) => Promise<void>; plan: AssistantPlanState; onApply: (action: PlanAction) => unknown }) {
  if (!plan.scenario) return null
  const summary = createTraditionalPlanSummary(plan.scenario, plan.selectedFlightId, plan.selectedHotelId)
  return <section className="assistant-genui" aria-label="Confirm simulated plan"><TraditionalPlanCostSummary scenario={plan.scenario} selectedFlightId={plan.selectedFlightId} selectedHotelId={plan.selectedHotelId} /><p>Fictional demo. This does not create a booking or payment.</p><Button disabled={!respond || plan.status !== 'review' || summary.state !== 'withinPolicy'} onClick={() => { const result = onApply({ type: 'confirmSimulatedPlan', revision: plan.revision }); void respond?.(result) }}>Confirm simulated plan</Button><Button tone="quiet" disabled={!respond} onClick={() => { const result = onApply({ type: 'backToOptions' }); void respond?.(result) }}>Back to options</Button></section>
}

function AssistantTools({ plan, getPlan, dispatch }: Props) {
  const { agent } = useAgent({ agentId })
  const sync = useCallback((next: AssistantPlanState, progress: string) => {
    agent.setState({ plan: planSnapshot(next), assistantProgress: progress })
    return { plan: planSnapshot(next), assistantProgress: progress }
  }, [agent])
  const applyDecision = useCallback((action: PlanAction) => sync(dispatch(action), planStage(getPlan())), [dispatch, getPlan, sync])
  useEffect(() => { sync(plan, planStage(plan)) }, [plan, sync])

  useFrontendTool({ name: 'resolve_trip_context', description: 'Apply the supplied origin and destination to the shared simulated plan and map.', parameters: z.object({ origin: z.string().min(1), destination: z.string().min(1) }), handler: async ({ origin, destination }) => {
    ensureStage(getPlan, 'route')
    const [from, to] = await Promise.all([resolveLocation(origin), resolveLocation(destination)])
    return sync(dispatch({ type: 'setRoute', route: { origin: from, destination: to } }), 'dates')
  }, agentId })

  useHumanInTheLoop({ name: 'show_date_confirmation', description: 'Ask the human to approve complete travel dates in a calendar.', parameters: z.object({ departureDate: z.string(), returnDate: z.string() }), agentId, render: ({ args, respond }) => {
    const departureDate = args.departureDate ?? ''
    const returnDate = args.returnDate ?? ''
    // Tool arguments arrive incrementally. Remount once they are complete so the
    // date inputs use the resolved values instead of the initial empty payload.
    return <CalendarDecision key={`${departureDate}:${returnDate}`} args={{ departureDate, returnDate }} respond={respond} plan={getPlan()} onApply={applyDecision} />
  } })
  useHumanInTheLoop({ name: 'show_flight_options', description: 'Show canonical simulated flights and wait for a human selection.', parameters: z.object({}), agentId, render: ({ respond }) => <ChoiceDecision kind="flights" respond={respond} plan={getPlan()} onApply={applyDecision} /> })
  useHumanInTheLoop({ name: 'show_stay_options', description: 'Show canonical simulated stays and wait for a human selection.', parameters: z.object({}), agentId, render: ({ respond }) => <ChoiceDecision kind="stays" respond={respond} plan={getPlan()} onApply={applyDecision} /> })
  useHumanInTheLoop({ name: 'show_cost_and_review', description: 'Show calculated costs and request a human review.', parameters: z.object({}), agentId, render: ({ respond }) => <ReviewDecision respond={respond} plan={getPlan()} onApply={applyDecision} /> })
  useHumanInTheLoop({ name: 'request_plan_confirmation', description: 'Request explicit human confirmation of the fictional plan.', parameters: z.object({}), agentId, render: ({ respond }) => <ConfirmationDecision respond={respond} plan={getPlan()} onApply={applyDecision} /> })
  useComponent({ name: 'show_plan_snapshot', description: 'Display a compact, fictional plan status card.', parameters: z.object({ title: z.string().min(1), detail: z.string().min(1) }), agentId, render: ({ title, detail }) => <section className="assistant-genui" aria-label="Plan status"><h3>{title}</h3><p>{detail}</p></section> })
  useRenderTool({ name: 'resolve_trip_context', parameters: z.object({ origin: z.string(), destination: z.string() }), agentId, render: ({ status, parameters }) => <section className="assistant-genui" aria-label="Route action"><p>{status === 'complete' ? `Route set: ${parameters.origin} → ${parameters.destination}` : `Setting route: ${parameters.origin} → ${parameters.destination}`}</p></section> })

  return null
}

export function CopilotAssistantPanel(props: Props) {
  const { agent } = useAgent({ agentId })
  const { copilotkit } = useCopilotKit()
  const renderToolCall = useRenderToolCall()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const feed = useRef<HTMLDivElement>(null)
  useEffect(() => { feed.current?.scrollTo?.({ top: feed.current.scrollHeight }) }, [agent.messages.length, agent.isRunning])
  async function submit(event?: FormEvent) {
    event?.preventDefault()
    const content = draft.trim()
    if (!content || agent.isRunning) return
    setError(null); agent.addMessage({ id: crypto.randomUUID(), role: 'user', content }); setDraft('')
    try { await copilotkit.runAgent({ agent }) } catch (failure) { setError(failure instanceof Error ? failure.message : 'The assistant is unavailable.') }
  }
  return <section className="assistant-panel" aria-labelledby="assistant-panel-heading">
    <AssistantTools {...props} />
    <div className="assistant-panel__heading"><div><h2 id="assistant-panel-heading">AI Assistant</h2><p>Plan fictional travel and choose each step together.</p></div><Badge>Simulated</Badge></div>
    <div ref={feed} className="assistant-conversation" aria-live="polite" aria-label="Assistant conversation">
      {agent.messages.length === 0 && <div className="assistant-empty-state"><p>Describe your trip to get started.</p><button className="assistant-suggestion" onClick={() => setDraft(atlasTravelScenario.request.naturalLanguage)}>Use Gustavo&apos;s fictional demo request</button></div>}
      {(agent.messages as unknown as Array<{ id: string; role: string; content: unknown; toolCalls?: Array<{ id: string }> }>).filter((message) => message.role === 'user' || message.role === 'assistant').map((message) => <article key={message.id} className={`assistant-message assistant-message--${message.role === 'user' ? 'traveler' : 'assistant'}`}><span className="assistant-message__author">{message.role === 'user' ? 'You' : 'Atlas Travel'}</span>{visibleContent(message.content) && <MessageContent content={visibleContent(message.content)} />}{(message.toolCalls ?? []).map((call) => <Fragment key={call.id}>{renderToolCall({ toolCall: call as never })}</Fragment>)}</article>)}
      {agent.isRunning && <p className="assistant-progress" role="status">Organizing your request…</p>}
    </div>
    {error && <div className="assistant-error" role="alert"><p>{error}</p><Button disabled={agent.isRunning} onClick={() => void copilotkit.runAgent({ agent }).catch((failure) => setError(failure instanceof Error ? failure.message : 'The assistant is unavailable.'))}>Retry assistant response</Button></div>}
    <form className="assistant-composer" onSubmit={submit}><label htmlFor="assistant-request">Your message</label><textarea id="assistant-request" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }} placeholder="Where would you like to travel?" rows={3} disabled={agent.isRunning} /><div className="assistant-composer__actions"><span role="status">{agent.isRunning ? 'Organizing your request…' : 'Enter to send · Shift+Enter for a new line'}</span><Button type="submit" disabled={!draft.trim() || agent.isRunning}>Send</Button></div></form>
  </section>
}
