import type { TripScenario } from '../data/tripScenario'
import { Badge, Button } from './ui'
import { createTraditionalPlanSummary } from './traditionalPlanSummary'

type TraditionalPlanConfirmationProps = {
  scenario: TripScenario
  selectedFlightId: string | null
  selectedHotelId: string | null
  state: 'review' | 'confirmed'
  onBackToOptions: () => void
  onConfirm: () => void
  onStartAnotherPlan: () => void
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatUsd(value: number): string {
  return currencyFormatter.format(value)
}

export function TraditionalPlanConfirmation({
  scenario,
  selectedFlightId,
  selectedHotelId,
  state,
  onBackToOptions,
  onConfirm,
  onStartAnotherPlan,
}: TraditionalPlanConfirmationProps) {
  const summary = createTraditionalPlanSummary(scenario, selectedFlightId, selectedHotelId)

  if (summary.flight === null || summary.hotel === null || summary.totalCostUsd === null || summary.state !== 'withinPolicy') {
    return (
      <section className="traditional-confirmation" aria-labelledby="traditional-confirmation-unavailable-heading">
        <div className="traditional-confirmation__heading">
          <div>
            <h2 id="traditional-confirmation-unavailable-heading">Plan review unavailable</h2>
            <p>Select eligible simulated travel options before reviewing the plan.</p>
          </div>
        </div>
        <Button type="button" tone="quiet" onClick={onBackToOptions}>Back to options</Button>
      </section>
    )
  }

  const flight = summary.flight
  const hotel = summary.hotel
  const hotelTotal = hotel.nightlyRateUsd * hotel.nights
  const isConfirmed = state === 'confirmed'

  return (
    <section className={`traditional-confirmation${isConfirmed ? ' traditional-confirmation--confirmed' : ''}`} aria-labelledby="traditional-confirmation-heading">
      <div className="traditional-confirmation__heading">
        <div>
          <h2 id="traditional-confirmation-heading">{isConfirmed ? 'Simulated plan confirmed' : 'Review simulated plan'}</h2>
          <p>{isConfirmed ? 'The selected plan is recorded only in this browser session.' : 'Check the selected items and total before the final simulated action.'}</p>
        </div>
        <Badge>{isConfirmed ? 'Simulated' : 'Review required'}</Badge>
      </div>

      <p className="traditional-confirmation__notice">
        <strong>Fictional demo.</strong> This does not create a booking, payment, notification, or external record.
      </p>

      <ul className="traditional-confirmation__items" aria-label="Selected simulated plan items">
        <li className="traditional-confirmation__item">
          <div><span>Flight</span><strong>{formatUsd(flight.roundTripPriceUsd)}</strong></div>
          <p>{flight.label} · {flight.cabin === 'premiumEconomy' ? 'Premium economy' : 'Economy'} · Round trip</p>
        </li>
        <li className="traditional-confirmation__item">
          <div><span>Stay</span><strong>{formatUsd(hotelTotal)}</strong></div>
          <p>{hotel.label} · {hotel.nights} nights at {formatUsd(hotel.nightlyRateUsd)} per night</p>
        </li>
      </ul>

      <div className="traditional-confirmation__total" aria-label={`Estimated total ${formatUsd(summary.totalCostUsd)}`}>
        <span>Estimated total</span>
        <strong>{formatUsd(summary.totalCostUsd)}</strong>
      </div>

      <p className="traditional-confirmation__policy">
        {isConfirmed
          ? 'The simulated plan remains within the fictional policy and available budget.'
          : scenario.policy.approvalRequiredBeforeSimulatedBooking
            ? 'The fictional policy requires this explicit review before a simulated confirmation.'
            : 'The selected plan is within the fictional policy and available budget.'}
      </p>

      {isConfirmed ? (
        <div className="traditional-confirmation__actions">
          <Button type="button" onClick={onStartAnotherPlan}>Plan another trip</Button>
        </div>
      ) : (
        <div className="traditional-confirmation__actions">
          <Button type="button" tone="quiet" onClick={onBackToOptions}>Back to options</Button>
          <Button type="button" onClick={onConfirm}>Confirm simulated plan</Button>
        </div>
      )}
    </section>
  )
}
