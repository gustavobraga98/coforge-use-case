import { useState } from 'react'
import type { AssistantGenUiWidget } from './assistantGenUiSchemas'
import { periodSchema, type AssistantPlanState, type PlanAction } from '../plan/travelPlan'
import { evaluateTraditionalFlightOptions } from './traditionalFlightFilters'
import { TraditionalPlanCostSummary } from './TraditionalPlanCostSummary'
import { createTraditionalPlanSummary } from './traditionalPlanSummary'
import { Button } from './ui'
import { formatDateRange, toIsoDate } from '../plan/dateFormat'

type Props = { widget: AssistantGenUiWidget; plan: AssistantPlanState; busy: boolean; onAction: (widget: AssistantGenUiWidget, action: PlanAction | null) => void }
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function CalendarWidget({ widget, plan, busy, onAction }: Props) {
  const [departureDate, setDepartureDate] = useState(plan.period?.departureDate ?? toIsoDate(String(widget.args.departureDate)) ?? '')
  const [returnDate, setReturnDate] = useState(plan.period?.returnDate ?? toIsoDate(String(widget.args.returnDate)) ?? '')
  const period = periodSchema.safeParse({ departureDate, returnDate })
  return <section className="assistant-genui" aria-label="Confirm travel dates">
    <h3>Confirm travel dates</h3>
    <p>Requested period: {formatDateRange(String(widget.args.departureDate), String(widget.args.returnDate))}. Review or approve the dates below.</p>
    <form onSubmit={(event) => { event.preventDefault(); if (period.success) onAction(widget, { type: 'confirmDates', period: period.data }) }}>
      <div className="assistant-date-confirmation__fields">
        <label>Departure<input required type="date" value={departureDate} disabled={busy} onChange={(event) => setDepartureDate(event.target.value)} /></label>
        <label>Return<input required type="date" min={departureDate} value={returnDate} disabled={busy} onChange={(event) => setReturnDate(event.target.value)} /></label>
      </div>
      {departureDate && returnDate && !period.success && <p role="alert">Return must be after departure.</p>}
      <Button type="submit" disabled={busy || !period.success}>Apply these dates</Button>
    </form>
  </section>
}

export function AssistantGenUi(props: Props) {
  const [editing, setEditing] = useState(false)
  const { widget, busy, onAction } = props
  // A historical widget must describe the plan at the time it was offered.
  // Otherwise an old comparison silently changes when a later edit rebuilds it.
  const plan = widget.snapshot ?? props.plan
  const actionableProps = { ...props, onAction: (value: AssistantGenUiWidget, action: PlanAction | null) => { onAction(value, action); setEditing(false) } }
  if (widget.status !== 'pending' && !editing && widget.name !== 'show_cost_and_review') {
    const editable = ['show_date_confirmation', 'show_trip_options'].includes(widget.name)
    return <section className="assistant-genui" aria-label="Planning action result"><p role="status">{widget.result ?? 'Applied to the simulated plan.'}</p>{editable && <Button tone="quiet" disabled={busy} onClick={() => setEditing(true)}>Edit choice</Button>}</section>
  }
  if (widget.name === 'respond_to_user') return <section className="assistant-genui" aria-label="Assistant response"><p>{String(widget.args.message)}</p></section>
  if (widget.name === 'show_date_confirmation') return <CalendarWidget {...actionableProps} />
  if (widget.name === 'resolve_trip_context') return <section className="assistant-genui"><h3>Route</h3><p>{String(widget.args.origin)} → {String(widget.args.destination)}</p></section>
  if (!plan.scenario) return <section className="assistant-genui"><p>Confirm the route and dates to continue.</p></section>
  const scenario = plan.scenario
  if (widget.name === 'show_trip_options') {
    const flights = widget.args.kind === 'flights'
    return <section className="assistant-genui" aria-label={flights ? 'Compare simulated flights' : 'Compare simulated stays'}>
      <h3>{flights ? 'Compare flights' : 'Compare stays'}</h3>
      <p>{scenario.request.route.origin.city} → {scenario.request.route.destination.city} · {formatDateRange(scenario.request.departureDate, scenario.request.returnDate)}</p>
      <ul className="assistant-options">
        {flights ? evaluateTraditionalFlightOptions(scenario, plan.filters).map(({ flight, isEligible, reasons }) => <li key={flight.id}>
          <strong>{flight.label} · {money(flight.roundTripPriceUsd)}</strong>
          <p>{flight.cabin === 'economy' ? 'Economy' : 'Premium economy'} · {flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stops`} · {flight.outbound.durationMinutes} min</p>
          <p>Outbound {flight.outbound.departsAt.slice(11,16)} → {flight.outbound.arrivesAt.slice(11,16)} · Return {flight.return.departsAt.slice(11,16)} → {flight.return.arrivesAt.slice(11,16)} (simulated schedule)</p>
          {reasons.map((reason) => <p key={reason}>{reason}</p>)}
          <Button disabled={busy || !isEligible} onClick={() => actionableProps.onAction(widget, { type: 'selectFlight', id: flight.id })}>{plan.selectedFlightId === flight.id ? 'Keep this flight' : 'Select flight'}</Button>
        </li>) : scenario.hotelOptions.map((hotel) => <li key={hotel.id}>
          <strong>{hotel.label} · {money(hotel.nightlyRateUsd * hotel.nights)}</strong>
          <p>{hotel.locationSummary} · {hotel.comfort} · {hotel.nights} nights at {money(hotel.nightlyRateUsd)}</p>
          <p>{hotel.nightlyRateUsd > scenario.policy.maxHotelNightlyRateUsd ? 'Above the fictional nightly policy limit.' : 'Within the fictional nightly policy limit.'}</p>
          <Button disabled={busy} onClick={() => actionableProps.onAction(widget, { type: 'selectHotel', id: hotel.id })}>{plan.selectedHotelId === hotel.id ? 'Keep this stay' : 'Select stay'}</Button>
        </li>)}
      </ul>
    </section>
  }
  const summary = createTraditionalPlanSummary(scenario, plan.selectedFlightId, plan.selectedHotelId)
  return <section className="assistant-genui" aria-label="Review simulated plan">
    <TraditionalPlanCostSummary scenario={scenario} selectedFlightId={plan.selectedFlightId} selectedHotelId={plan.selectedHotelId} />
    {widget.name === 'show_cost_and_review' && <>
      <p>Review these fictional selections before enabling confirmation.</p>
      <Button disabled={busy || summary.state !== 'withinPolicy'} onClick={() => actionableProps.onAction(widget, { type: 'requestReview' })}>Review simulated plan</Button>
    </>}
    {widget.name === 'request_plan_confirmation' && <>
      <p>{summary.flight?.label} · {summary.hotel?.label}</p>
      <p>Fictional demo. This does not create a booking or payment.</p>
      <Button disabled={busy || plan.status !== 'review' || widget.revision !== plan.revision || summary.state !== 'withinPolicy'} onClick={() => actionableProps.onAction(widget, { type: 'confirmSimulatedPlan', revision: widget.revision! })}>Confirm simulated plan</Button>
      <Button tone="quiet" disabled={busy} onClick={() => actionableProps.onAction(widget, { type: 'backToOptions' })}>Back to options</Button>
    </>}
  </section>
}
