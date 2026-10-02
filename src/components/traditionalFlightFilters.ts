import type { FlightOption, TripScenario } from '../data/tripScenario'

export type TraditionalFlightFilters = {
  directOnly: boolean
  arrivalBeforeRequestedTime: boolean
  maxPriceUsd: number | null
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
  const requestedArrivalTime = new Date(scenario.request.arriveBefore).getTime()

  return scenario.flightOptions.filter((flight) => {
    const isDirectMatch = !filters.directOnly || (flight.outbound.stops === 0 && flight.return.stops === 0)
    const isArrivalTimeMatch = !filters.arrivalBeforeRequestedTime
      || new Date(flight.outbound.arrivesAt).getTime() < requestedArrivalTime
    const isPriceMatch = filters.maxPriceUsd === null || flight.roundTripPriceUsd <= filters.maxPriceUsd

    return isDirectMatch && isArrivalTimeMatch && isPriceMatch
  })
}
