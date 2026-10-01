import type { TripScenario } from '../data/tripScenario'
import { Badge, Card } from './ui'

export type TripContextStatus = TripScenario['initialTripState']['status']

type TripContextSummaryProps = {
  scenario: TripScenario
  status?: TripContextStatus
}

const statusLabels: Record<TripContextStatus, string> = {
  pending: 'Pending',
  planning: 'Planning',
  readyToBook: 'Ready to book',
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
})

const budgetFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`))
}

function formatDateRange(departureDate: string, returnDate: string) {
  const departure = new Date(`${departureDate}T00:00:00Z`)
  const returnDateValue = new Date(`${returnDate}T00:00:00Z`)
  const sameMonth = departure.getUTCMonth() === returnDateValue.getUTCMonth()

  return sameMonth
    ? `${formatDate(departureDate)}–${returnDateValue.getUTCDate()}`
    : `${formatDate(departureDate)}–${formatDate(returnDate)}`
}

export function TripContextSummary({ scenario, status = scenario.initialTripState.status }: TripContextSummaryProps) {
  const { traveler, request, agenda, budget } = scenario
  const primaryCommitment = agenda[0]

  return (
    <section className="trip-context" aria-labelledby="trip-context-heading">
      <div className="trip-context__heading">
        <div>
          <h2 id="trip-context-heading">Trip context</h2>
          <p>Planning request for {traveler.firstName}</p>
        </div>
        <Badge tone="muted">Illustrative</Badge>
      </div>

      <Card className="trip-context__status" label={`Trip status: ${statusLabels[status]}`}>
        <span className={`trip-status trip-status--${status}`} aria-hidden="true" />
        <div>
          <span>Trip status</span>
          <strong>{statusLabels[status]}</strong>
        </div>
      </Card>

      <dl className="trip-context__details">
        <div className="trip-context__route">
          <dt>Route</dt>
          <dd>{request.route.origin.city} <span aria-hidden="true">→</span> {request.route.destination.city}</dd>
        </div>
        <div>
          <dt>Dates</dt>
          <dd>{formatDateRange(request.departureDate, request.returnDate)}</dd>
        </div>
        {primaryCommitment && (
          <div>
            <dt>Key commitment</dt>
            <dd>{primaryCommitment.title} · {timeFormatter.format(new Date(primaryCommitment.startsAt))}</dd>
          </div>
        )}
        <div>
          <dt>Arrival</dt>
          <dd>Before {timeFormatter.format(new Date(request.arriveBefore))} on {formatDate(request.departureDate)}</dd>
        </div>
        <div>
          <dt>Preference</dt>
          <dd>{request.directFlightsPreferred ? 'Direct flight preferred' : 'Flight preference not specified'}</dd>
        </div>
        <div>
          <dt>Budget limit</dt>
          <dd>{budgetFormatter.format(budget.limit)}</dd>
        </div>
      </dl>
    </section>
  )
}
