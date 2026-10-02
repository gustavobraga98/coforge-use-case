import type { FormEvent } from 'react'
import type { TripScenario } from '../data/tripScenario'
import { Badge, Button } from './ui'

export type TraditionalSearchCriteria = {
  traveler: string
  origin: string
  destination: string
  departureDate: string
  returnDate: string
}

type TraditionalSearchFormProps = {
  scenario: TripScenario
  criteria: TraditionalSearchCriteria
  isSearching: boolean
  onCriteriaChange: (criteria: TraditionalSearchCriteria) => void
  onSubmit: () => void
}

type SearchReadyPanelProps = {
  criteria: TraditionalSearchCriteria
  onModifySearch: () => void
}

export function TraditionalSearchForm({
  scenario,
  criteria,
  isSearching,
  onCriteriaChange,
  onSubmit,
}: TraditionalSearchFormProps) {
  function updateCriteria(field: keyof TraditionalSearchCriteria, value: string) {
    onCriteriaChange({ ...criteria, [field]: value })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="traditional-search" aria-labelledby="traditional-search-heading">
      <div className="traditional-search__heading">
        <div>
          <h2 id="traditional-search-heading">Find travel options</h2>
          <p>Search simulated options for this trip.</p>
        </div>
        <Badge>Traditional mode</Badge>
      </div>

      <form className="traditional-search__form" onSubmit={handleSubmit} aria-busy={isSearching}>
        <label className="field">
          <span>Traveler</span>
          <select
            value={criteria.traveler}
            onChange={(event) => updateCriteria('traveler', event.target.value)}
            disabled={isSearching}
          >
            <option value={scenario.traveler.firstName}>{scenario.traveler.firstName}</option>
          </select>
        </label>

        <div className="traditional-search__route-fields">
          <label className="field">
            <span>From</span>
            <input
              type="text"
              value={criteria.origin}
              onChange={(event) => updateCriteria('origin', event.target.value)}
              disabled={isSearching}
              required
            />
          </label>
          <label className="field">
            <span>To</span>
            <input
              type="text"
              value={criteria.destination}
              onChange={(event) => updateCriteria('destination', event.target.value)}
              disabled={isSearching}
              required
            />
          </label>
        </div>

        <div className="traditional-search__date-fields">
          <label className="field">
            <span>Depart</span>
            <input
              type="date"
              value={criteria.departureDate}
              onChange={(event) => updateCriteria('departureDate', event.target.value)}
              disabled={isSearching}
              required
            />
          </label>
          <label className="field">
            <span>Return</span>
            <input
              type="date"
              min={criteria.departureDate}
              value={criteria.returnDate}
              onChange={(event) => updateCriteria('returnDate', event.target.value)}
              disabled={isSearching}
              required
            />
          </label>
        </div>

        <Button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching options…' : 'Search simulated options'}
        </Button>
        <p className="traditional-search__notice" role="status">
          {isSearching ? 'Searching simulated options locally.' : 'No live availability or external booking is used.'}
        </p>
      </form>
    </section>
  )
}

export function SearchReadyPanel({ criteria, onModifySearch }: SearchReadyPanelProps) {
  return (
    <section className="search-ready" aria-labelledby="search-ready-heading">
      <div className="search-ready__heading">
        <div>
          <h2 id="search-ready-heading">Options ready to review</h2>
          <p>Simulated options match the submitted search.</p>
        </div>
        <Badge>Search complete</Badge>
      </div>
      <dl className="search-ready__criteria">
        <div><dt>Traveler</dt><dd>{criteria.traveler}</dd></div>
        <div><dt>Route</dt><dd>{criteria.origin} <span aria-hidden="true">→</span> {criteria.destination}</dd></div>
        <div><dt>Dates</dt><dd>{criteria.departureDate} to {criteria.returnDate}</dd></div>
      </dl>
      <p className="search-ready__next-step">Flight and stay filters will appear here next.</p>
      <Button type="button" tone="quiet" onClick={onModifySearch}>Modify search</Button>
    </section>
  )
}
