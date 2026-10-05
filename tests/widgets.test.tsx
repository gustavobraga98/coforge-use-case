import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { AssistantPanel } from '../src/components/AssistantPanel'
import { useTravelPlan } from '../src/plan/useTravelPlan'
import { initialConversation, readAgUiStream, visibleText } from '../src/plan/agUiConversation'
import { applyPlanAction, initialPlan } from '../src/plan/travelPlan'
import { findTravelLocation } from '../src/data/tripScenario'
import { formatDate, toIsoDate } from '../src/plan/dateFormat'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const route = { origin: findTravelLocation('Chicago')!, destination: findTravelLocation('Miami')! }
const period = { departureDate: '2026-11-04', returnDate: '2026-11-06' }
function readyPlan() { return applyPlanAction(applyPlanAction(initialPlan(), { type: 'setRoute', route }), { type: 'confirmDates', period }) }

function Harness() {
  const { plan, dispatch, getPlan } = useTravelPlan()
  const [conversation, setConversation] = useState(initialConversation)
  return <><AssistantPanel plan={plan} dispatch={dispatch} getPlan={getPlan} conversation={conversation} onConversationChange={setConversation} /><output data-testid="plan">{JSON.stringify(plan)}</output></>
}
function stream(events: Record<string, unknown>[]) {
  return new Response(events.map((event) => `data: ${JSON.stringify(event)}\r\n\r\n`).join(''), { headers: { 'Content-Type': 'text/event-stream' } })
}
function tool(name: string, args: unknown, id: string) {
  return [
    { type: 'TOOL_CALL_START', toolCallId: id, toolCallName: name },
    { type: 'TOOL_CALL_ARGS', toolCallId: id, delta: JSON.stringify(args) },
    { type: 'TOOL_CALL_END', toolCallId: id },
  ]
}
const end = { type: 'RUN_FINISHED' }

describe('Shared simulated travel plan', () => {
  it.each([
    ['04/10', '2026-10-04'],
    ['04/10/2027', '2027-10-04'],
    ['4 de outubro de 2027', '2027-10-04'],
    ['October 4, 2027', '2027-10-04'],
  ])('uses DD/MM/YYYY for %s', (input, expected) => {
    expect(toIsoDate(input)).toBe(expected)
    expect(formatDate(expected)).toBe(expected.split('-').reverse().join('/'))
  })
  it('does not invent a period for a route and rejects impossible dates', () => {
    const routed = applyPlanAction(initialPlan(), { type: 'setRoute', route })
    expect(routed.scenario).toBeNull()
    expect(() => applyPlanAction(routed, { type: 'confirmDates', period: { departureDate: '2026-02-30', returnDate: '2026-03-01' } })).toThrow()
  })
  it('invalidates selections and confirmation when the period changes', () => {
    let plan = readyPlan()
    plan = applyPlanAction(plan, { type: 'selectFlight', id: plan.scenario!.flightOptions[0].id })
    plan = applyPlanAction(plan, { type: 'selectHotel', id: plan.scenario!.hotelOptions[0].id })
    plan = applyPlanAction(plan, { type: 'requestReview' })
    const revision = plan.revision
    plan = applyPlanAction(plan, { type: 'confirmSimulatedPlan', revision })
    expect(plan.status).toBe('confirmed')
    expect(() => applyPlanAction(plan, { type: 'confirmSimulatedPlan', revision })).toThrow()
    plan = applyPlanAction(plan, { type: 'confirmDates', period: { ...period, returnDate: '2026-11-07' } })
    expect(plan.selectedFlightId).toBeNull()
    expect(plan.selectedHotelId).toBeNull()
    expect(plan.status).toBe('planning')
  })
  it('blocks ineligible flights and over-budget review', () => {
    let plan = readyPlan()
    plan = applyPlanAction(plan, { type: 'setConstraints', constraints: { maxPriceUsd: 1 } })
    expect(() => applyPlanAction(plan, { type: 'selectFlight', id: plan.scenario!.flightOptions[0].id })).toThrow()
    plan = applyPlanAction(plan, { type: 'setConstraints', constraints: { maxPriceUsd: null, budgetUsd: 1 } })
    plan = applyPlanAction(plan, { type: 'selectFlight', id: plan.scenario!.flightOptions[0].id })
    plan = applyPlanAction(plan, { type: 'selectHotel', id: plan.scenario!.hotelOptions[0].id })
    expect(() => applyPlanAction(plan, { type: 'requestReview' })).toThrow()
  })
})

it('preserves split SSE frames, ignores private reasoning and reports interrupted streams', async () => {
  const events: unknown[] = []
  const raw = 'data: {"type":"TEXT_MESSAGE_CONTENT","delta":"FINAL: Olá"}\r\n\r\ndata: {"type":"RUN_FINISHED"}\r\n\r\n'
  const bytes = new TextEncoder().encode(raw)
  const body = new ReadableStream({ start(controller) { for (const byte of bytes) controller.enqueue(new Uint8Array([byte])); controller.close() } })
  await readAgUiStream(new Response(body), (event) => events.push(event))
  expect(events).toHaveLength(2)
  expect(visibleText('private reasoning')).toBe('')
  expect(visibleText('private reasoning FINAL: Olá')).toBe('Olá')
  await expect(readAgUiStream(stream([]), () => {})).rejects.toThrow('interrupted')
})

it.each(['Quero viajar de Chicago para Miami 04/11 e 04/12', 'Plan Chicago to Miami 04/11 to 04/12'])('resumes calendar, selections and confirmation with actual tool results: %s', async (request) => {
  const requests: Record<string, unknown>[] = []
  let run = 0
  vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
    requests.push(JSON.parse(init.body))
    run++
    const events = run === 1 ? tool('resolve_trip_context', { origin: 'chicago', destination: 'miami' }, 'route')
      : run === 2 ? tool('show_date_confirmation', { departureDate: '04/11', returnDate: '04/12' }, 'calendar')
      : run === 3 ? tool('show_trip_options', { kind: 'flights' }, 'flights')
      : run === 4 ? tool('show_trip_options', { kind: 'stays' }, 'stays')
      : run === 5 ? tool('show_cost_and_review', {}, 'cost')
      : run === 6 ? tool('request_plan_confirmation', {}, 'review')
      : [{ type: 'TEXT_MESSAGE_CONTENT', delta: 'FINAL: Your simulated plan is confirmed.' }]
    return stream([...events, end])
  }))
  render(<Harness />)
  fireEvent.change(screen.getByLabelText('Your message'), { target: { value: request } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  await screen.findByRole('heading', { name: 'Confirm travel dates' })
  expect((requests[0].tools as { name: string }[]).map((item) => item.name)).toEqual(['respond_to_user', 'resolve_trip_context'])
  expect((requests[1].tools as { name: string }[]).map((item) => item.name)).toEqual(['respond_to_user', 'show_date_confirmation'])
  expect(screen.getByLabelText('Departure').getAttribute('value')).toBe(period.departureDate)
  fireEvent.change(screen.getByLabelText('Departure'), { target: { value: period.departureDate } })
  fireEvent.change(screen.getByLabelText('Return'), { target: { value: period.returnDate } })
  fireEvent.click(screen.getByRole('button', { name: 'Apply these dates' }))
  await screen.findByRole('heading', { name: 'Compare flights' })
  const resumed = requests[2] as { messages: { role: string; toolCallId?: string; content: string }[] }
  const calendar = resumed.messages.find((message) => message.role === 'tool' && message.toolCallId === 'calendar')!
  expect(JSON.parse(calendar.content).period).toEqual(period)
  expect(JSON.parse(calendar.content).datesConfirmed).toBe(true)
  expect((requests[2].tools as { name: string }[]).map((item) => item.name)).toEqual(['respond_to_user', 'show_trip_options'])
  fireEvent.click(screen.getAllByRole('button', { name: 'Select flight' })[0])
  await screen.findByRole('heading', { name: 'Compare stays' })
  fireEvent.click(screen.getAllByRole('button', { name: 'Select stay' })[0])
  const review = await screen.findByRole('button', { name: 'Review simulated plan' })
  fireEvent.click(review)
  const confirm = await screen.findByRole('button', { name: 'Confirm simulated plan' })
  await waitFor(() => expect((confirm as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(confirm)
  await screen.findByText('Your simulated plan is confirmed.')
  expect(JSON.parse(screen.getByTestId('plan').textContent!).status).toBe('confirmed')
  expect(run).toBe(7)
})

it('keeps confirmed dates on failure and retries without duplicating the tool result', async () => {
  const requests: { messages: { role: string; toolCallId?: string }[]; state: { period: unknown } }[] = []
  let run = 0
  vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
    requests.push(JSON.parse(init.body)); run++
    if (run === 1) return stream([...tool('resolve_trip_context', { origin: 'Chicago', destination: 'Miami' }, 'route'), end])
    if (run === 2) return stream([...tool('show_date_confirmation', { departureDate: '04/11', returnDate: '04/12' }, 'calendar'), end])
    if (run === 3) throw new Error('Local model offline')
    return stream([...tool('show_trip_options', { kind: 'flights' }, 'flights'), end])
  }))
  render(<Harness />)
  fireEvent.change(screen.getByLabelText('Your message'), { target: { value: 'Chicago to Miami 04/11 to 04/12' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  await screen.findByLabelText('Departure')
  fireEvent.change(screen.getByLabelText('Departure'), { target: { value: period.departureDate } })
  fireEvent.change(screen.getByLabelText('Return'), { target: { value: period.returnDate } })
  fireEvent.click(screen.getByRole('button', { name: 'Apply these dates' }))
  await screen.findByText('Local model offline')
  expect(JSON.parse(screen.getByTestId('plan').textContent!).period).toEqual(period)
  fireEvent.click(screen.getByRole('button', { name: 'Retry assistant response' }))
  await screen.findByRole('heading', { name: 'Compare flights' })
  expect(requests[3].messages.filter((message) => message.role === 'tool' && message.toolCallId === 'calendar')).toHaveLength(1)
  expect(requests[3].state.period).toEqual(period)
})

it('does not treat Done as calendar approval and keeps the new calendar operable', async () => {
  let run = 0
  const requests: { messages: { role: string; toolCallId?: string; content: string }[] }[] = []
  vi.stubGlobal('fetch', vi.fn(async (_url, init) => {
    requests.push(JSON.parse(init.body)); run++
    const event = run === 1
      ? tool('resolve_trip_context', { origin: 'Chicago', destination: 'Miami' }, 'route')
      : tool('show_date_confirmation', { departureDate: '04/11', returnDate: '04/12' }, `calendar-${run}`)
    return stream([...event, end])
  }))
  render(<Harness />)
  fireEvent.change(screen.getByLabelText('Your message'), { target: { value: 'Chicago to Miami 04/11 to 04/12' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  await screen.findByLabelText('Departure')
  fireEvent.change(screen.getByLabelText('Your message'), { target: { value: 'Done!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  await waitFor(() => expect(run).toBe(3))
  const cancelled = requests[2].messages.find((message) => message.toolCallId === 'calendar-2')!
  expect(JSON.parse(cancelled.content).cancelled).toBe(true)
  expect(JSON.parse(screen.getByTestId('plan').textContent!).period).toBeNull()
  await screen.findByLabelText('Departure')
})

it('uses the deterministic next widget when a local model returns only conversational text', async () => {
  let run = 0
  vi.stubGlobal('fetch', vi.fn(async () => {
    run++
    const events = run === 1
      ? tool('respond_to_user', { message: 'I can help with that.' }, 'reply')
      : tool('show_date_confirmation', { departureDate: '2026-11-04', returnDate: '2026-11-06' }, 'calendar')
    return stream([...events, end])
  }))
  render(<Harness />)
  fireEvent.change(screen.getByLabelText('Your message'), { target: { value: 'Chicago to Miami 04/11 to 04/12' } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
  await screen.findByRole('heading', { name: 'Confirm travel dates' })
  expect(run).toBe(2)
  expect(screen.queryByText('I can help with that.')).toBeNull()
})
