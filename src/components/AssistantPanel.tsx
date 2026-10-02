import type { TripScenario } from '../data/tripScenario'
import { Badge } from './ui'

type AssistantPanelProps = {
  scenario: TripScenario
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
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

  return departure.getUTCMonth() === returnDateValue.getUTCMonth()
    ? `${formatDate(departureDate)}–${returnDateValue.getUTCDate()}`
    : `${formatDate(departureDate)}–${formatDate(returnDate)}`
}

export function AssistantPanel({ scenario }: AssistantPanelProps) {
  const { traveler, request, budget } = scenario

  return (
    <section className="assistant-panel" aria-labelledby="assistant-panel-heading">
      <div className="assistant-panel__heading">
        <h2 id="assistant-panel-heading">AI Assistant</h2>
        <Badge>Planning</Badge>
      </div>

      <article className="assistant-message assistant-message--traveler" aria-label={`${traveler.firstName}'s fictional planning request`}>
        <span className="assistant-message__author">{traveler.firstName}</span>
        <p>{request.naturalLanguage}</p>
      </article>

      <article className="assistant-message assistant-message--assistant" aria-labelledby="assistant-response-heading">
        <span className="assistant-message__author">Atlas Travel</span>
        <h3 id="assistant-response-heading">I&apos;ll organize this trip around the following requirements.</h3>
        <ul className="assistant-requirements" aria-label="Recognized trip requirements">
          <li><span>Route</span><strong>{request.route.origin.city} to {request.route.destination.city}</strong></li>
          <li><span>Travel period</span><strong>{formatDateRange(request.departureDate, request.returnDate)}</strong></li>
          <li><span>Arrival</span><strong>Before {timeFormatter.format(new Date(request.arriveBefore))} on {formatDate(request.departureDate)}</strong></li>
          <li><span>Flight preference</span><strong>{request.directFlightsPreferred ? 'Direct flights' : 'No preference specified'}</strong></li>
          <li><span>Budget ceiling</span><strong>{budgetFormatter.format(budget.limit)}</strong></li>
        </ul>
      </article>

      <p className="assistant-panel__planning-status" role="status">
        <span aria-hidden="true" /> Organizing your plan
      </p>

      <div className="assistant-alternatives" role="group" aria-label="Simulated alternative planning areas">
        <section className="assistant-placeholder" aria-labelledby="flight-alternatives-heading">
          <h3 id="flight-alternatives-heading">Flight alternatives</h3>
          <p>Suitable flight alternatives will appear here.</p>
        </section>
        <section className="assistant-placeholder" aria-labelledby="stay-alternatives-heading">
          <h3 id="stay-alternatives-heading">Stay alternatives</h3>
          <p>Suitable stay alternatives will appear here.</p>
        </section>
      </div>
    </section>
  )
}
