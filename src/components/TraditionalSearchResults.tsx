import type { KeyboardEvent } from 'react'
import type { TripScenario } from '../data/tripScenario'
import type { TraditionalSearchCriteria } from './TraditionalSearchForm'
import {
  createInitialTraditionalFlightFilters,
  filterTraditionalFlightOptions,
  type TraditionalFlightFilters,
} from './traditionalFlightFilters'
import { Badge, Button } from './ui'

export type TraditionalResultsTab = 'flights' | 'stays'

type TraditionalSearchResultsProps = {
  scenario: TripScenario
  criteria: TraditionalSearchCriteria
  filters: TraditionalFlightFilters
  activeTab: TraditionalResultsTab
  onFiltersChange: (filters: TraditionalFlightFilters) => void
  onActiveTabChange: (tab: TraditionalResultsTab) => void
  onModifySearch: () => void
}

const tabs: readonly TraditionalResultsTab[] = ['flights', 'stays']

const priceOptions = [
  { value: '', label: 'Any price' },
  { value: '1500', label: 'Up to $1,500' },
  { value: '2000', label: 'Up to $2,000' },
] as const

function formatArrivalTime(dateTime: string): string {
  const [hour, minute] = dateTime.slice(11, 16).split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDateRange(criteria: TraditionalSearchCriteria): string {
  return `${criteria.departureDate} to ${criteria.returnDate}`
}

export function TraditionalSearchResults({
  scenario,
  criteria,
  filters,
  activeTab,
  onFiltersChange,
  onActiveTabChange,
  onModifySearch,
}: TraditionalSearchResultsProps) {
  const matchingFlights = filterTraditionalFlightOptions(scenario, filters)
  const arrivalLabel = formatArrivalTime(scenario.request.arriveBefore)

  function updateFilter<Key extends keyof TraditionalFlightFilters>(key: Key, value: TraditionalFlightFilters[Key]) {
    onFiltersChange({ ...filters, [key]: value })
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = tabs.indexOf(activeTab)
    const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const isPrevious = event.key === 'ArrowLeft' || event.key === 'ArrowUp'

    if (!isNext && !isPrevious && event.key !== 'Home' && event.key !== 'End') {
      return
    }

    event.preventDefault()
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : (currentIndex + (isNext ? 1 : -1) + tabs.length) % tabs.length
    const nextTab = tabs[nextIndex]
    onActiveTabChange(nextTab)
    document.getElementById(`traditional-results-tab-${nextTab}`)?.focus()
  }

  return (
    <section className="traditional-results" aria-labelledby="traditional-results-heading">
      <div className="traditional-results__heading">
        <div>
          <h2 id="traditional-results-heading">Travel options</h2>
          <p>Locally filtered simulated options for {criteria.origin} to {criteria.destination}.</p>
        </div>
        <Badge>Search complete</Badge>
      </div>

      <dl className="traditional-results__criteria">
        <div><dt>Traveler</dt><dd>{criteria.traveler}</dd></div>
        <div><dt>Dates</dt><dd>{formatDateRange(criteria)}</dd></div>
      </dl>

      <div className="traditional-results__tabs" role="tablist" aria-label="Travel result types">
        {tabs.map((tab) => {
          const isActive = activeTab === tab
          const label = tab === 'flights' ? 'Flights' : 'Stays'

          return (
            <button
              id={`traditional-results-tab-${tab}`}
              key={tab}
              className="traditional-results__tab"
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`traditional-results-panel-${tab}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onActiveTabChange(tab)}
              onKeyDown={handleTabKeyDown}
            >
              {label}
            </button>
          )
        })}
      </div>

      {activeTab === 'flights' ? (
        <div
          id="traditional-results-panel-flights"
          className="traditional-results__panel"
          role="tabpanel"
          aria-labelledby="traditional-results-tab-flights"
        >
          <fieldset className="traditional-flight-filters">
            <legend>Filter flights</legend>
            <label className="filter-check">
              <input
                type="checkbox"
                checked={filters.directOnly}
                onChange={(event) => updateFilter('directOnly', event.target.checked)}
              />
              <span>Direct flights only</span>
            </label>
            <label className="filter-check">
              <input
                type="checkbox"
                checked={filters.arrivalBeforeRequestedTime}
                onChange={(event) => updateFilter('arrivalBeforeRequestedTime', event.target.checked)}
              />
              <span>Arrive before {arrivalLabel}</span>
            </label>
            <label className="field traditional-flight-filters__price">
              <span>Round-trip price</span>
              <select
                value={filters.maxPriceUsd ?? ''}
                onChange={(event) => updateFilter('maxPriceUsd', event.target.value === '' ? null : Number(event.target.value))}
              >
                {priceOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </fieldset>

          <div className="traditional-results__filter-summary" aria-live="polite">
            <span>Applied filters</span>
            <p>
              {filters.directOnly ? 'Direct flights' : 'Connections allowed'} · {filters.arrivalBeforeRequestedTime ? `arrive before ${arrivalLabel}` : 'any arrival time'} · {filters.maxPriceUsd === null ? 'any price' : `up to ${formatPrice(filters.maxPriceUsd)}`}
            </p>
          </div>

          {matchingFlights.length > 0 ? (
            <ul className="traditional-flight-list" aria-label={`${matchingFlights.length} matching simulated flights`}>
              {matchingFlights.map((flight) => (
                <li key={flight.id} className="traditional-flight-list__item">
                  <div>
                    <strong>{flight.label}</strong>
                    <span>{flight.outbound.stops === 0 ? 'Direct' : `${flight.outbound.stops} stop${flight.outbound.stops === 1 ? '' : 's'}`}</span>
                  </div>
                  <dl>
                    <div><dt>Arrives</dt><dd>{formatArrivalTime(flight.outbound.arrivesAt)}</dd></div>
                    <div><dt>Round trip</dt><dd>{formatPrice(flight.roundTripPriceUsd)}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <div className="traditional-results__empty" role="status">
              <h3>No simulated flights match these filters.</h3>
              <p>Adjust the filters or reset them to review the available options.</p>
            </div>
          )}

          <Button type="button" tone="quiet" onClick={() => onFiltersChange(createInitialTraditionalFlightFilters())}>Reset filters</Button>
        </div>
      ) : (
        <div
          id="traditional-results-panel-stays"
          className="traditional-results__panel traditional-results__stays"
          role="tabpanel"
          aria-labelledby="traditional-results-tab-stays"
        >
          <h3>Stay results are coming next</h3>
          <p>Simulated stay results and their filters will be added in T11. Your flight filters remain available when you return to Flights.</p>
        </div>
      )}

      <Button type="button" tone="quiet" onClick={onModifySearch}>Modify search</Button>
    </section>
  )
}
