export type Location = {
  city: string
  country: string
  latitude: number
  longitude: number
}

export type TripRoute = {
  origin: Location
  destination: Location
}

export type FlightLeg = {
  departsAt: string
  arrivesAt: string
  durationMinutes: number
  stops: number
}

export type FlightOption = {
  id: string
  label: string
  cabin: 'economy' | 'premiumEconomy'
  roundTripPriceUsd: number
  outbound: FlightLeg
  return: FlightLeg
}

export type HotelOption = {
  id: string
  label: string
  comfort: 'essential' | 'standard' | 'enhanced'
  checkInDate: string
  checkOutDate: string
  nights: number
  nightlyRateUsd: number
}

export type TravelAlternative = {
  id: string
  priority: 'lowestCost' | 'highestComfort' | 'earliestArrival'
  label: string
  flightOptionId: string
  hotelOptionId: string
}

export type TripScenario = {
  traveler: { firstName: string }
  request: {
    naturalLanguage: string
    route: TripRoute
    departureDate: string
    returnDate: string
    arriveBefore: string
    directFlightsPreferred: boolean
  }
  agenda: readonly {
    id: string
    title: string
    startsAt: string
    endsAt: string
  }[]
  budget: { currency: 'USD'; limit: number }
  policy: {
    maxHotelNightlyRateUsd: number
    permittedCabins: readonly FlightOption['cabin'][]
    approvalRequiredBeforeSimulatedBooking: boolean
    approvalRequiredForExceptions: boolean
  }
  flightOptions: readonly FlightOption[]
  hotelOptions: readonly HotelOption[]
  alternatives: readonly TravelAlternative[]
  initialTripState: {
    status: 'pending' | 'planning' | 'readyToBook'
    selectedAlternativeId: string | null
  }
}

export const atlasTravelScenario: TripScenario = {
  traveler: { firstName: 'Gustavo' },
  request: {
    naturalLanguage: 'Plan a trip for Gustavo from São Paulo to New York, November 12–16, 2026. He needs to arrive before 3 p.m. on November 12, prefers direct flights, and has a budget of up to US$3,000.',
    route: {
      origin: { city: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
      destination: { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
    },
    departureDate: '2026-11-12',
    returnDate: '2026-11-16',
    arriveBefore: '2026-11-12T15:00:00-05:00',
    directFlightsPreferred: true,
  },
  agenda: [
    {
      id: 'thursday-meeting',
      title: 'Project planning meeting',
      startsAt: '2026-11-12T16:30:00-05:00',
      endsAt: '2026-11-12T18:00:00-05:00',
    },
  ],
  budget: { currency: 'USD', limit: 3000 },
  policy: {
    maxHotelNightlyRateUsd: 220,
    permittedCabins: ['economy', 'premiumEconomy'],
    approvalRequiredBeforeSimulatedBooking: true,
    approvalRequiredForExceptions: true,
  },
  flightOptions: [
    {
      id: 'value-flight',
      label: 'Value direct flight',
      cabin: 'economy',
      roundTripPriceUsd: 1200,
      outbound: {
        departsAt: '2026-11-12T02:00:00-03:00',
        arrivesAt: '2026-11-12T11:00:00-05:00',
        durationMinutes: 660,
        stops: 0,
      },
      return: {
        departsAt: '2026-11-16T19:00:00-05:00',
        arrivesAt: '2026-11-17T06:30:00-03:00',
        durationMinutes: 570,
        stops: 0,
      },
    },
    {
      id: 'comfort-flight',
      label: 'Comfort direct flight',
      cabin: 'premiumEconomy',
      roundTripPriceUsd: 1800,
      outbound: {
        departsAt: '2026-11-12T01:30:00-03:00',
        arrivesAt: '2026-11-12T10:00:00-05:00',
        durationMinutes: 630,
        stops: 0,
      },
      return: {
        departsAt: '2026-11-16T20:30:00-05:00',
        arrivesAt: '2026-11-17T08:00:00-03:00',
        durationMinutes: 570,
        stops: 0,
      },
    },
    {
      id: 'early-flight',
      label: 'Early arrival direct flight',
      cabin: 'economy',
      roundTripPriceUsd: 1500,
      outbound: {
        departsAt: '2026-11-12T00:05:00-03:00',
        arrivesAt: '2026-11-12T07:35:00-05:00',
        durationMinutes: 570,
        stops: 0,
      },
      return: {
        departsAt: '2026-11-16T18:15:00-05:00',
        arrivesAt: '2026-11-17T05:45:00-03:00',
        durationMinutes: 570,
        stops: 0,
      },
    },
  ],
  hotelOptions: [
    {
      id: 'essential-hotel',
      label: 'Essential stay',
      comfort: 'essential',
      checkInDate: '2026-11-12',
      checkOutDate: '2026-11-16',
      nights: 4,
      nightlyRateUsd: 165,
    },
    {
      id: 'enhanced-hotel',
      label: 'Enhanced stay',
      comfort: 'enhanced',
      checkInDate: '2026-11-12',
      checkOutDate: '2026-11-16',
      nights: 4,
      nightlyRateUsd: 220,
    },
    {
      id: 'standard-hotel',
      label: 'Standard stay',
      comfort: 'standard',
      checkInDate: '2026-11-12',
      checkOutDate: '2026-11-16',
      nights: 4,
      nightlyRateUsd: 185,
    },
  ],
  alternatives: [
    {
      id: 'lowest-cost',
      priority: 'lowestCost',
      label: 'Lowest cost',
      flightOptionId: 'value-flight',
      hotelOptionId: 'essential-hotel',
    },
    {
      id: 'highest-comfort',
      priority: 'highestComfort',
      label: 'Highest comfort',
      flightOptionId: 'comfort-flight',
      hotelOptionId: 'enhanced-hotel',
    },
    {
      id: 'earliest-arrival',
      priority: 'earliestArrival',
      label: 'Earliest arrival',
      flightOptionId: 'early-flight',
      hotelOptionId: 'standard-hotel',
    },
  ],
  initialTripState: { status: 'pending', selectedAlternativeId: null },
}

export function calculateAlternativeTotal(scenario: TripScenario, alternative: TravelAlternative): number {
  const flight = scenario.flightOptions.find(({ id }) => id === alternative.flightOptionId)
  const hotel = scenario.hotelOptions.find(({ id }) => id === alternative.hotelOptionId)

  if (!flight || !hotel) {
    throw new Error(`Unknown flight or hotel option in alternative: ${alternative.id}`)
  }

  return flight.roundTripPriceUsd + hotel.nightlyRateUsd * hotel.nights
}
