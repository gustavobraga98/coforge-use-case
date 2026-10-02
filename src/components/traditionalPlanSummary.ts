import type { FlightOption, HotelOption, TripScenario } from '../data/tripScenario'

export type TraditionalPlanSummaryState = 'incomplete' | 'withinPolicy' | 'requiresReview'

export type TraditionalPlanAlert = {
  id: 'missing-flight' | 'missing-hotel' | 'budget' | 'flight-policy' | 'hotel-policy'
  title: string
  description: string
}

export type TraditionalPlanSummary = {
  flight: FlightOption | null
  hotel: HotelOption | null
  flightCostUsd: number | null
  hotelCostUsd: number | null
  totalCostUsd: number | null
  budgetRemainingUsd: number | null
  state: TraditionalPlanSummaryState
  alerts: readonly TraditionalPlanAlert[]
}

export function createTraditionalPlanSummary(
  scenario: TripScenario,
  selectedFlightId: string | null,
  selectedHotelId: string | null,
): TraditionalPlanSummary {
  const flight = scenario.flightOptions.find(({ id }) => id === selectedFlightId) ?? null
  const hotel = scenario.hotelOptions.find(({ id }) => id === selectedHotelId) ?? null
  const flightCostUsd = flight?.roundTripPriceUsd ?? null
  const hotelCostUsd = hotel === null ? null : hotel.nightlyRateUsd * hotel.nights
  const totalCostUsd = flightCostUsd === null || hotelCostUsd === null ? null : flightCostUsd + hotelCostUsd
  const budgetRemainingUsd = totalCostUsd === null ? null : scenario.budget.limit - totalCostUsd
  const alerts: TraditionalPlanAlert[] = []

  if (flight === null) {
    alerts.push({
      id: 'missing-flight',
      title: 'Flight selection needed',
      description: 'Select a flight to calculate the full trip cost. Simulated confirmation remains blocked until both travel items are selected.',
    })
  }

  if (hotel === null) {
    alerts.push({
      id: 'missing-hotel',
      title: 'Stay selection needed',
      description: 'Select a stay to calculate the full trip cost. Simulated confirmation remains blocked until both travel items are selected.',
    })
  }

  if (flight !== null && !scenario.policy.permittedCabins.includes(flight.cabin)) {
    alerts.push({
      id: 'flight-policy',
      title: 'Flight cabin is outside policy',
      description: `The selected ${flight.cabin} cabin is not permitted by the fictional travel policy. Choose an allowed cabin to continue.`,
    })
  }

  if (hotel !== null && hotel.nightlyRateUsd > scenario.policy.maxHotelNightlyRateUsd) {
    const nightlyDifference = hotel.nightlyRateUsd - scenario.policy.maxHotelNightlyRateUsd
    const stayDifference = nightlyDifference * hotel.nights
    alerts.push({
      id: 'hotel-policy',
      title: 'Stay rate is outside policy',
      description: `This stay is ${formatUsd(nightlyDifference)} above the ${formatUsd(scenario.policy.maxHotelNightlyRateUsd)} nightly limit (${formatUsd(stayDifference)} across ${hotel.nights} nights). Choose a stay within the nightly limit.`,
    })
  }

  if (budgetRemainingUsd !== null && budgetRemainingUsd < 0) {
    alerts.push({
      id: 'budget',
      title: 'Trip exceeds the available budget',
      description: `The selected trip is ${formatUsd(Math.abs(budgetRemainingUsd))} above the ${formatUsd(scenario.budget.limit)} budget. Choose a lower-cost flight or stay to review the plan.`,
    })
  }

  return {
    flight,
    hotel,
    flightCostUsd,
    hotelCostUsd,
    totalCostUsd,
    budgetRemainingUsd,
    state: flight === null || hotel === null ? 'incomplete' : alerts.length === 0 ? 'withinPolicy' : 'requiresReview',
    alerts,
  }
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
