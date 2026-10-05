import type { FormEvent } from 'react'
import { travelLocations, type TripScenario } from '../data/tripScenario'
import { Badge, Button } from './ui'

export type TraditionalSearchCriteria = {
  traveler: string
  origin: string
  destination: string
  departureDate: string
  returnDate: string
}

type TraditionalSearchFormProps = {
  scenarios: readonly TripScenario[]
  criteria: TraditionalSearchCriteria
  isSearching: boolean
  onCriteriaChange: (criteria: TraditionalSearchCriteria) => void
  onSubmit: () => void
}

export function TraditionalSearchForm({
  scenarios,
  criteria,
  isSearching,
  onCriteriaChange,
  onSubmit,
}: TraditionalSearchFormProps) {
  const travelers = [...new Set(scenarios.map(({ traveler }) => traveler.firstName))]
  const isReadyToSearch = Boolean(
    criteria.traveler
    && criteria.origin
    && criteria.destination
    && criteria.departureDate
    && criteria.returnDate,
  )
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
            required
          >
            <option value="" disabled>Choose a traveler</option>
            {travelers.map((traveler) => <option key={traveler} value={traveler}>{traveler}</option>)}
          </select>
        </label>

        <div className="traditional-search__route-fields">
          <label className="field">
            <span>From</span>
            <select
              value={criteria.origin}
              onChange={(event) => updateCriteria('origin', event.target.value)}
              disabled={isSearching}
              required
            >
              <option value="" disabled>Choose an origin</option>
              {travelLocations.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
            </select>
          </label>
          <label className="field">
            <span>To</span>
            <select
              value={criteria.destination}
              onChange={(event) => updateCriteria('destination', event.target.value)}
              disabled={isSearching}
              required
            >
              <option value="" disabled>Choose a destination</option>
              {travelLocations.filter((destination) => destination !== criteria.origin).map((destination) => <option key={destination} value={destination}>{destination}</option>)}
            </select>
          </label>
        </div>
        <p className="traditional-search__destination-help">
          Choose a route from the curated demo cities. Atlas Travel generates stable fictional options locally.
        </p>

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

        <Button type="submit" disabled={isSearching || !isReadyToSearch}>
          {isSearching ? 'Searching options…' : 'Search simulated options'}
        </Button>
        <p className="traditional-search__notice" role="status">
          {isSearching
            ? 'Searching simulated options locally.'
            : isReadyToSearch
              ? 'No live availability or external booking is used.'
              : 'Choose a fictional origin and destination to enable the simulated search.'}
        </p>
      </form>
    </section>
  )
}
