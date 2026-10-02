import type { KeyboardEvent } from 'react'
import type { FlightLeg, FlightOption, HotelOption, TripScenario } from '../data/tripScenario'
import type { TraditionalSearchCriteria } from './TraditionalSearchForm'
import {
  createInitialTraditionalFlightFilters,
  evaluateTraditionalFlightOptions,
  type TraditionalFlightFilters,
} from './traditionalFlightFilters'
import { TraditionalPlanCostSummary } from './TraditionalPlanCostSummary'
import { Badge, Button } from './ui'

export type TraditionalResultsTab = 'flights' | 'stays'

type TraditionalSearchResultsProps = {
  scenario: TripScenario
  criteria: TraditionalSearchCriteria
  filters: TraditionalFlightFilters
  activeTab: TraditionalResultsTab
  selectedFlightId: string | null
  selectedHotelId: string | null
  onFiltersChange: (filters: TraditionalFlightFilters) => void
  onActiveTabChange: (tab: TraditionalResultsTab) => void
  onFlightSelect: (flightId: string) => void
  onHotelSelect: (hotelId: string) => void
  onModifySearch: () => void
}

const tabs: readonly TraditionalResultsTab[] = ['flights', 'stays']

const priceOptions = [
  { value: '', label: 'Any price' },
  { value: '1500', label: 'Up to $1,500' },
  { value: '2000', label: 'Up to $2,000' },
] as const

function formatTime(dateTime: string): string {
  const [hour, minute] = dateTime.slice(11, 16).split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12

  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`
}

function formatStops(stops: number): string {
  return stops === 0 ? 'Direct' : `${stops} stop${stops === 1 ? '' : 's'}`
}

function formatCabin(cabin: FlightOption['cabin']): string {
  return cabin === 'premiumEconomy' ? 'Premium economy' : 'Economy'
}

function formatLeg(leg: FlightLeg): string {
  return `${formatTime(leg.departsAt)} → ${formatTime(leg.arrivesAt)}`
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

function formatComfort(comfort: HotelOption['comfort']): string {
  return `${comfort.charAt(0).toUpperCase()}${comfort.slice(1)} comfort`
}

function formatStayPeriod(hotel: HotelOption): string {
  return `${hotel.checkInDate} to ${hotel.checkOutDate} · ${hotel.nights} nights`
}

export function TraditionalSearchResults({
  scenario,
  criteria,
  filters,
  activeTab,
  selectedFlightId,
  selectedHotelId,
  onFiltersChange,
  onActiveTabChange,
  onFlightSelect,
  onHotelSelect,
  onModifySearch,
}: TraditionalSearchResultsProps) {
  const evaluatedFlights = evaluateTraditionalFlightOptions(scenario, filters)
  const eligibleFlightCount = evaluatedFlights.filter(({ isEligible }) => isEligible).length
  const selectedFlight = selectedFlightId === null
    ? null
    : scenario.flightOptions.find(({ id }) => id === selectedFlightId) ?? null
  const arrivalLabel = formatTime(scenario.request.arriveBefore)
  const tradeOffsByFlightId = new Map(
    scenario.alternatives.map((alternative) => [alternative.flightOptionId, alternative.label]),
  )
  const selectedHotel = selectedHotelId === null
    ? null
    : scenario.hotelOptions.find(({ id }) => id === selectedHotelId) ?? null
  const lowestNightlyRate = Math.min(...scenario.hotelOptions.map(({ nightlyRateUsd }) => nightlyRateUsd))
  const comfortOrder: Record<HotelOption['comfort'], number> = { essential: 0, standard: 1, enhanced: 2 }
  const highestComfort = Math.max(...scenario.hotelOptions.map(({ comfort }) => comfortOrder[comfort]))

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

      <TraditionalPlanCostSummary
        scenario={scenario}
        selectedFlightId={selectedFlightId}
        selectedHotelId={selectedHotelId}
      />

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
            <p className="traditional-results__eligibility">{eligibleFlightCount} of {evaluatedFlights.length} simulated flights available to select.</p>
          </div>

          {selectedFlight && (
            <section className="selected-flight" aria-labelledby="selected-flight-heading">
              <div>
                <span>Selected flight</span>
                <h3 id="selected-flight-heading">{selectedFlight.label}</h3>
              </div>
              <dl>
                <div><dt>Round trip</dt><dd>{formatPrice(selectedFlight.roundTripPriceUsd)}</dd></div>
                <div><dt>Outbound</dt><dd>{formatLeg(selectedFlight.outbound)}</dd></div>
              </dl>
              <p>Choose another available option below to change this selection.</p>
            </section>
          )}

          <ul className="traditional-flight-list" aria-label={`${evaluatedFlights.length} simulated flight options`}>
            {evaluatedFlights.map(({ flight, isEligible, reasons }) => {
              const isSelected = selectedFlightId === flight.id
              const reasonId = `flight-${flight.id}-reasons`

              return (
                <li key={flight.id}>
                  <article
                    className={`traditional-flight-card${isSelected ? ' traditional-flight-card--selected' : ''}${!isEligible ? ' traditional-flight-card--unavailable' : ''}`}
                    aria-label={`${flight.label}${isSelected ? ', selected' : ''}`}
                  >
                    <div className="traditional-flight-card__heading">
                      <div>
                        <span className="traditional-flight-card__tradeoff">{tradeOffsByFlightId.get(flight.id) ?? 'Flight option'}</span>
                        <h3>{flight.label}</h3>
                      </div>
                      <strong>{formatPrice(flight.roundTripPriceUsd)}</strong>
                    </div>
                    <dl className="traditional-flight-card__details">
                      <div><dt>Cabin</dt><dd>{formatCabin(flight.cabin)}</dd></div>
                      <div><dt>Outbound</dt><dd>{formatLeg(flight.outbound)}</dd></div>
                      <div><dt>Return</dt><dd>{formatLeg(flight.return)}</dd></div>
                      <div><dt>Duration</dt><dd>{formatDuration(flight.outbound.durationMinutes)} out · {formatDuration(flight.return.durationMinutes)} back</dd></div>
                      <div><dt>Stops</dt><dd>{formatStops(flight.outbound.stops)} out · {formatStops(flight.return.stops)} back</dd></div>
                    </dl>
                    {reasons.length > 0 && (
                      <div id={reasonId} className="traditional-flight-card__reasons">
                        <strong>Unavailable with these filters</strong>
                        <ul>{reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                      </div>
                    )}
                    {isEligible ? (
                      <Button
                        type="button"
                        tone={isSelected ? 'quiet' : 'primary'}
                        aria-pressed={isSelected}
                        onClick={() => onFlightSelect(flight.id)}
                      >
                        {isSelected ? 'Selected flight' : `Select ${flight.label}`}
                      </Button>
                    ) : isSelected ? (
                      <p className="traditional-flight-card__selected-notice">This selected flight no longer meets the active filters.</p>
                    ) : null}
                  </article>
                </li>
              )
            })}
          </ul>

          {eligibleFlightCount === 0 && (
            <div className="traditional-results__empty" role="status">
              <h3>No simulated flights are available to select.</h3>
              <p>Every option remains visible above. Adjust the filters or reset them to make an option available.</p>
            </div>
          )}

          <Button type="button" tone="quiet" onClick={() => onFiltersChange(createInitialTraditionalFlightFilters())}>Reset filters</Button>
        </div>
      ) : (
        <div
          id="traditional-results-panel-stays"
          className="traditional-results__panel"
          role="tabpanel"
          aria-labelledby="traditional-results-tab-stays"
        >
          <div className="traditional-stays__summary">
            <p>{scenario.hotelOptions.length} simulated stays for the requested period. Review each nightly rate against the {formatPrice(scenario.policy.maxHotelNightlyRateUsd)} policy limit.</p>
          </div>

          {selectedHotel && (
            <section className="selected-hotel" aria-labelledby="selected-hotel-heading">
              <div>
                <span>Selected stay</span>
                <h3 id="selected-hotel-heading">{selectedHotel.label}</h3>
              </div>
              <dl>
                <div><dt>Total stay</dt><dd>{formatPrice(selectedHotel.nightlyRateUsd * selectedHotel.nights)}</dd></div>
                <div><dt>Period</dt><dd>{selectedHotel.nights} nights</dd></div>
              </dl>
              <p>Choose another stay below to change this selection.</p>
            </section>
          )}

          <ul className="traditional-hotel-list" aria-label={`${scenario.hotelOptions.length} simulated hotel options`}>
            {scenario.hotelOptions.map((hotel) => {
              const isSelected = selectedHotelId === hotel.id
              const isLowestCost = hotel.nightlyRateUsd === lowestNightlyRate
              const isHighestComfort = comfortOrder[hotel.comfort] === highestComfort
              const totalStay = hotel.nightlyRateUsd * hotel.nights
              const isWithinPolicy = hotel.nightlyRateUsd <= scenario.policy.maxHotelNightlyRateUsd

              return (
                <li key={hotel.id}>
                  <article
                    className={`traditional-hotel-card${isSelected ? ' traditional-hotel-card--selected' : ''}`}
                    aria-label={`${hotel.label}${isSelected ? ', selected' : ''}`}
                  >
                    <div className="traditional-hotel-card__heading">
                      <div>
                        <div className="traditional-hotel-card__features">
                          {isLowestCost && <span>Lowest cost</span>}
                          {isHighestComfort && <span>Highest comfort</span>}
                        </div>
                        <h3>{hotel.label}</h3>
                      </div>
                      <strong>{formatPrice(totalStay)}</strong>
                    </div>
                    <dl className="traditional-hotel-card__details">
                      <div><dt>Nightly rate</dt><dd>{formatPrice(hotel.nightlyRateUsd)}</dd></div>
                      <div><dt>Stay total</dt><dd>{formatPrice(totalStay)}</dd></div>
                      <div><dt>Period</dt><dd>{formatStayPeriod(hotel)}</dd></div>
                      <div><dt>Location</dt><dd>{hotel.locationSummary}</dd></div>
                      <div><dt>Comfort</dt><dd>{formatComfort(hotel.comfort)}</dd></div>
                      <div><dt>Policy</dt><dd className={`traditional-hotel-card__policy${isWithinPolicy ? '' : ' traditional-hotel-card__policy--alert'}`}>{isWithinPolicy ? 'Within policy' : 'Outside policy'}</dd></div>
                    </dl>
                    <Button
                      type="button"
                      tone={isSelected ? 'quiet' : 'primary'}
                      aria-pressed={isSelected}
                      onClick={() => onHotelSelect(hotel.id)}
                    >
                      {isSelected ? 'Selected stay' : `Select ${hotel.label}`}
                    </Button>
                  </article>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <Button type="button" tone="quiet" onClick={onModifySearch}>Modify search</Button>
    </section>
  )
}
