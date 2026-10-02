import type { TripScenario } from '../data/tripScenario'
import { createTraditionalPlanSummary } from './traditionalPlanSummary'

type TraditionalPlanCostSummaryProps = {
  scenario: TripScenario
  selectedFlightId: string | null
  selectedHotelId: string | null
}

const statusCopy = {
  incomplete: {
    label: 'Information missing',
    detail: 'Select both travel items before simulated confirmation can continue.',
  },
  withinPolicy: {
    label: 'Within policy',
    detail: 'The selected plan is ready for the simulated confirmation step.',
  },
  requiresReview: {
    label: 'Review required',
    detail: 'Resolve the alerts below before simulated confirmation can continue.',
  },
} as const

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatUsd(value: number | null): string {
  return value === null ? 'Select an option' : currencyFormatter.format(value)
}

export function TraditionalPlanCostSummary({
  scenario,
  selectedFlightId,
  selectedHotelId,
}: TraditionalPlanCostSummaryProps) {
  const summary = createTraditionalPlanSummary(scenario, selectedFlightId, selectedHotelId)
  const status = statusCopy[summary.state]
  const remainingBudgetLabel = summary.budgetRemainingUsd === null
    ? 'Awaiting selections'
    : summary.budgetRemainingUsd >= 0
      ? `${currencyFormatter.format(summary.budgetRemainingUsd)} remaining`
      : `${currencyFormatter.format(Math.abs(summary.budgetRemainingUsd))} over budget`

  return (
    <section className={`traditional-plan-summary traditional-plan-summary--${summary.state}`} aria-labelledby="traditional-plan-summary-heading">
      <div className="traditional-plan-summary__heading">
        <div>
          <h3 id="traditional-plan-summary-heading">Cost &amp; policy summary</h3>
          <p>Estimated locally from selected simulated options.</p>
        </div>
        <span className="traditional-plan-summary__status" aria-live="polite">{status.label}</span>
      </div>

      <dl className="traditional-plan-summary__costs" aria-live="polite">
        <div>
          <dt>Flight</dt>
          <dd>{formatUsd(summary.flightCostUsd)}</dd>
        </div>
        <div>
          <dt>Stay</dt>
          <dd>{formatUsd(summary.hotelCostUsd)}</dd>
        </div>
        <div className="traditional-plan-summary__total">
          <dt>Estimated total</dt>
          <dd>{formatUsd(summary.totalCostUsd)}</dd>
        </div>
        <div>
          <dt>Budget status</dt>
          <dd>{remainingBudgetLabel}</dd>
        </div>
      </dl>

      <p className="traditional-plan-summary__detail">{status.detail}</p>

      {summary.alerts.length > 0 && (
        <ul className="traditional-plan-summary__alerts" aria-label="Plan alerts">
          {summary.alerts.map((alert) => (
            <li key={alert.id}>
              <strong>{alert.title}</strong>
              <p>{alert.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
