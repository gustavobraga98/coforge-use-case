import type { FlightOption, TripScenario } from '../data/tripScenario'

export type TraditionalFlightFilters = {
  directOnly: boolean
  arrivalBeforeRequestedTime: boolean
  maxPriceUsd: number | null
}

export type TraditionalFlightEligibility = {
  flight: FlightOption
  isEligible: boolean
  reasons: readonly string[]
}

export function createInitialTraditionalFlightFilters(): TraditionalFlightFilters {
  return {
    directOnly: true,
    arrivalBeforeRequestedTime: true,
    maxPriceUsd: null,
  }
}

export function filterTraditionalFlightOptions(
  scenario: Pick<TripScenario, 'flightOptions' | 'request'>,
  filters: TraditionalFlightFilters,
): FlightOption[] {
  return evaluateTraditionalFlightOptions(scenario, filters)
    .filter(({ isEligible }) => isEligible)
    .map(({ flight }) => flight)
}

export function evaluateTraditionalFlightOptions(
  scenario: Pick<TripScenario, 'flightOptions' | 'request'>,
  filters: TraditionalFlightFilters,
): TraditionalFlightEligibility[] {
  const requestedArrivalTime = new Date(scenario.request.arriveBefore).getTime()

  return scenario.flightOptions.map((flight) => {
    const isDirectMatch = !filters.directOnly || (flight.outbound.stops === 0 && flight.return.stops === 0)
    const isArrivalTimeMatch = !filters.arrivalBeforeRequestedTime
      || new Date(flight.outbound.arrivesAt).getTime() < requestedArrivalTime
    const isPriceMatch = filters.maxPriceUsd === null || flight.roundTripPriceUsd <= filters.maxPriceUsd
    const reasons = [
      !isDirectMatch ? 'Includes a connection while direct flights are required.' : null,
      !isArrivalTimeMatch ? 'Arrives after the requested arrival time.' : null,
      !isPriceMatch ? `Price exceeds the ${formatUsd(filters.maxPriceUsd)} limit.` : null,
    ].filter((reason): reason is string => reason !== null)

    return {
      flight,
      isEligible: reasons.length === 0,
      reasons,
    }
  })
}

function formatUsd(value: number | null): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}
