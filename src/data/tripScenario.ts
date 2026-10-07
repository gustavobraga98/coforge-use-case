export type Location = {
  city: string
  country: string
  timeZone: string
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
  locationSummary: string
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
  id: string
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
  id: 'new-york',
  traveler: { firstName: 'Gustavo' },
  request: {
    naturalLanguage: 'Plan a trip for Gustavo from São Paulo to New York, November 12–16, 2026. He needs to arrive before 3 p.m. on November 12 and prefers direct flights.',
    route: {
      origin: { city: 'São Paulo', country: 'Brazil', timeZone: 'America/Sao_Paulo', latitude: -23.5505, longitude: -46.6333 },
      destination: { city: 'New York', country: 'United States', timeZone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
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
    {
      id: 'flexible-flight',
      label: 'Flexible direct flight',
      cabin: 'economy',
      roundTripPriceUsd: 2500,
      outbound: {
        departsAt: '2026-11-12T03:15:00-03:00',
        arrivesAt: '2026-11-12T12:40:00-05:00',
        durationMinutes: 625,
        stops: 0,
      },
      return: {
        departsAt: '2026-11-16T21:15:00-05:00',
        arrivesAt: '2026-11-17T08:45:00-03:00',
        durationMinutes: 570,
        stops: 0,
      },
    },
  ],
  hotelOptions: [
    {
      id: 'essential-hotel',
      label: 'Essential stay',
      locationSummary: 'Central Business Quarter',
      comfort: 'essential',
      checkInDate: '2026-11-12',
      checkOutDate: '2026-11-16',
      nights: 4,
      nightlyRateUsd: 165,
    },
    {
      id: 'enhanced-hotel',
      label: 'Enhanced stay',
      locationSummary: 'Parkside District',
      comfort: 'enhanced',
      checkInDate: '2026-11-12',
      checkOutDate: '2026-11-16',
      nights: 4,
      nightlyRateUsd: 220,
    },
    {
      id: 'standard-hotel',
      label: 'Standard stay',
      locationSummary: 'Riverside District',
      comfort: 'standard',
      checkInDate: '2026-11-12',
      checkOutDate: '2026-11-16',
      nights: 4,
      nightlyRateUsd: 185,
    },
    {
      id: 'executive-hotel',
      label: 'Executive stay',
      locationSummary: 'Midtown Conference District',
      comfort: 'enhanced',
      checkInDate: '2026-11-12',
      checkOutDate: '2026-11-16',
      nights: 4,
      nightlyRateUsd: 285,
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

const londonTravelScenario: TripScenario = {
  id: 'london',
  traveler: { firstName: 'Gustavo' },
  request: {
    naturalLanguage: 'Plan a trip for Gustavo from São Paulo to London, October 5–9, 2026. He needs to arrive before 2 p.m. on October 5, prefers direct flights, and has a budget of up to US$3,400.',
    route: {
      origin: { city: 'São Paulo', country: 'Brazil', timeZone: 'America/Sao_Paulo', latitude: -23.5505, longitude: -46.6333 },
      destination: { city: 'London', country: 'United Kingdom', timeZone: 'Europe/London', latitude: 51.5072, longitude: -0.1276 },
    },
    departureDate: '2026-10-05',
    returnDate: '2026-10-09',
    arriveBefore: '2026-10-05T14:00:00+01:00',
    directFlightsPreferred: true,
  },
  agenda: [{
    id: 'london-workshop',
    title: 'Regional strategy workshop',
    startsAt: '2026-10-05T15:30:00+01:00',
    endsAt: '2026-10-05T17:00:00+01:00',
  }],
  budget: { currency: 'USD', limit: 3400 },
  policy: {
    maxHotelNightlyRateUsd: 250,
    permittedCabins: ['economy', 'premiumEconomy'],
    approvalRequiredBeforeSimulatedBooking: true,
    approvalRequiredForExceptions: true,
  },
  flightOptions: [
    { id: 'london-value-flight', label: 'Value direct flight', cabin: 'economy', roundTripPriceUsd: 1450, outbound: { departsAt: '2026-10-04T19:30:00-03:00', arrivesAt: '2026-10-05T11:00:00+01:00', durationMinutes: 690, stops: 0 }, return: { departsAt: '2026-10-09T22:15:00+01:00', arrivesAt: '2026-10-10T05:45:00-03:00', durationMinutes: 690, stops: 0 } },
    { id: 'london-comfort-flight', label: 'Comfort direct flight', cabin: 'premiumEconomy', roundTripPriceUsd: 2050, outbound: { departsAt: '2026-10-04T20:45:00-03:00', arrivesAt: '2026-10-05T12:15:00+01:00', durationMinutes: 690, stops: 0 }, return: { departsAt: '2026-10-09T20:30:00+01:00', arrivesAt: '2026-10-10T04:00:00-03:00', durationMinutes: 690, stops: 0 } },
    { id: 'london-early-flight', label: 'Early arrival direct flight', cabin: 'economy', roundTripPriceUsd: 1780, outbound: { departsAt: '2026-10-04T17:30:00-03:00', arrivesAt: '2026-10-05T09:00:00+01:00', durationMinutes: 690, stops: 0 }, return: { departsAt: '2026-10-09T18:45:00+01:00', arrivesAt: '2026-10-10T02:15:00-03:00', durationMinutes: 690, stops: 0 } },
  ],
  hotelOptions: [
    { id: 'london-essential-hotel', label: 'Essential City stay', locationSummary: 'South Bank business area', comfort: 'essential', checkInDate: '2026-10-05', checkOutDate: '2026-10-09', nights: 4, nightlyRateUsd: 195 },
    { id: 'london-standard-hotel', label: 'Standard Central stay', locationSummary: 'Bloomsbury district', comfort: 'standard', checkInDate: '2026-10-05', checkOutDate: '2026-10-09', nights: 4, nightlyRateUsd: 230 },
    { id: 'london-enhanced-hotel', label: 'Enhanced Riverside stay', locationSummary: 'Westminster district', comfort: 'enhanced', checkInDate: '2026-10-05', checkOutDate: '2026-10-09', nights: 4, nightlyRateUsd: 285 },
  ],
  alternatives: [
    { id: 'london-lowest-cost', priority: 'lowestCost', label: 'Lowest cost', flightOptionId: 'london-value-flight', hotelOptionId: 'london-essential-hotel' },
    { id: 'london-highest-comfort', priority: 'highestComfort', label: 'Highest comfort', flightOptionId: 'london-comfort-flight', hotelOptionId: 'london-standard-hotel' },
    { id: 'london-earliest-arrival', priority: 'earliestArrival', label: 'Earliest arrival', flightOptionId: 'london-early-flight', hotelOptionId: 'london-standard-hotel' },
  ],
  initialTripState: { status: 'pending', selectedAlternativeId: null },
}

const mexicoCityTravelScenario: TripScenario = {
  id: 'mexico-city',
  traveler: { firstName: 'Gustavo' },
  request: {
    naturalLanguage: 'Plan a trip for Gustavo from São Paulo to Mexico City, December 2–6, 2026. He needs to arrive before 4 p.m. on December 2, prefers direct flights, and has a budget of up to US$2,600.',
    route: {
      origin: { city: 'São Paulo', country: 'Brazil', timeZone: 'America/Sao_Paulo', latitude: -23.5505, longitude: -46.6333 },
      destination: { city: 'Mexico City', country: 'Mexico', timeZone: 'America/Mexico_City', latitude: 19.4326, longitude: -99.1332 },
    },
    departureDate: '2026-12-02',
    returnDate: '2026-12-06',
    arriveBefore: '2026-12-02T16:00:00-06:00',
    directFlightsPreferred: true,
  },
  agenda: [{
    id: 'mexico-client-session',
    title: 'Product alignment session',
    startsAt: '2026-12-02T17:30:00-06:00',
    endsAt: '2026-12-02T19:00:00-06:00',
  }],
  budget: { currency: 'USD', limit: 2600 },
  policy: {
    maxHotelNightlyRateUsd: 190,
    permittedCabins: ['economy', 'premiumEconomy'],
    approvalRequiredBeforeSimulatedBooking: true,
    approvalRequiredForExceptions: true,
  },
  flightOptions: [
    { id: 'mexico-value-flight', label: 'Value direct flight', cabin: 'economy', roundTripPriceUsd: 980, outbound: { departsAt: '2026-12-02T01:20:00-03:00', arrivesAt: '2026-12-02T08:10:00-06:00', durationMinutes: 590, stops: 0 }, return: { departsAt: '2026-12-06T20:30:00-06:00', arrivesAt: '2026-12-07T07:20:00-03:00', durationMinutes: 590, stops: 0 } },
    { id: 'mexico-comfort-flight', label: 'Comfort direct flight', cabin: 'premiumEconomy', roundTripPriceUsd: 1440, outbound: { departsAt: '2026-12-02T00:15:00-03:00', arrivesAt: '2026-12-02T07:00:00-06:00', durationMinutes: 585, stops: 0 }, return: { departsAt: '2026-12-06T19:15:00-06:00', arrivesAt: '2026-12-07T06:00:00-03:00', durationMinutes: 585, stops: 0 } },
    { id: 'mexico-early-flight', label: 'Early arrival direct flight', cabin: 'economy', roundTripPriceUsd: 1220, outbound: { departsAt: '2026-12-01T22:45:00-03:00', arrivesAt: '2026-12-02T05:30:00-06:00', durationMinutes: 585, stops: 0 }, return: { departsAt: '2026-12-06T18:00:00-06:00', arrivesAt: '2026-12-07T04:45:00-03:00', durationMinutes: 585, stops: 0 } },
  ],
  hotelOptions: [
    { id: 'mexico-essential-hotel', label: 'Essential Reforma stay', locationSummary: 'Reforma business district', comfort: 'essential', checkInDate: '2026-12-02', checkOutDate: '2026-12-06', nights: 4, nightlyRateUsd: 130 },
    { id: 'mexico-standard-hotel', label: 'Standard Centro stay', locationSummary: 'Historic center district', comfort: 'standard', checkInDate: '2026-12-02', checkOutDate: '2026-12-06', nights: 4, nightlyRateUsd: 165 },
    { id: 'mexico-enhanced-hotel', label: 'Enhanced Polanco stay', locationSummary: 'Polanco business district', comfort: 'enhanced', checkInDate: '2026-12-02', checkOutDate: '2026-12-06', nights: 4, nightlyRateUsd: 225 },
  ],
  alternatives: [
    { id: 'mexico-lowest-cost', priority: 'lowestCost', label: 'Lowest cost', flightOptionId: 'mexico-value-flight', hotelOptionId: 'mexico-essential-hotel' },
    { id: 'mexico-highest-comfort', priority: 'highestComfort', label: 'Highest comfort', flightOptionId: 'mexico-comfort-flight', hotelOptionId: 'mexico-standard-hotel' },
    { id: 'mexico-earliest-arrival', priority: 'earliestArrival', label: 'Earliest arrival', flightOptionId: 'mexico-early-flight', hotelOptionId: 'mexico-standard-hotel' },
  ],
  initialTripState: { status: 'pending', selectedAlternativeId: null },
}

const additionalOrigins: readonly Location[] = [
  { city: 'Rio de Janeiro', country: 'Brazil', timeZone: 'America/Sao_Paulo', latitude: -22.9068, longitude: -43.1729 },
  { city: 'Buenos Aires', country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires', latitude: -34.6037, longitude: -58.3816 },
]

function createAlternateOriginScenario(
  scenario: TripScenario,
  origin: Location,
  priceAdjustmentUsd: number,
): TripScenario {
  const originId = origin.city.toLowerCase().replaceAll(' ', '-')

  return {
    ...scenario,
    id: `${originId}-${scenario.id}`,
    request: {
      ...scenario.request,
      naturalLanguage: scenario.request.naturalLanguage.replace('from São Paulo', `from ${origin.city}`),
      route: { ...scenario.request.route, origin },
    },
    flightOptions: scenario.flightOptions.map((flight) => ({
      ...flight,
      id: `${originId}-${flight.id}`,
      roundTripPriceUsd: flight.roundTripPriceUsd + priceAdjustmentUsd,
    })),
    alternatives: scenario.alternatives.map((alternative) => ({
      ...alternative,
      id: `${originId}-${alternative.id}`,
      flightOptionId: `${originId}-${alternative.flightOptionId}`,
    })),
  }
}

export const atlasTravelScenarios = [
  atlasTravelScenario,
  londonTravelScenario,
  mexicoCityTravelScenario,
  ...[atlasTravelScenario, londonTravelScenario, mexicoCityTravelScenario].map((scenario) =>
    createAlternateOriginScenario(scenario, additionalOrigins[0], 90),
  ),
  ...[atlasTravelScenario, londonTravelScenario, mexicoCityTravelScenario].map((scenario) =>
    createAlternateOriginScenario(scenario, additionalOrigins[1], 140),
  ),
] as const

const travelLocationProfiles: Record<string, Location> = {
  Amsterdam: { city: 'Amsterdam', country: 'Netherlands', timeZone: 'Europe/Amsterdam', latitude: 52.3676, longitude: 4.9041 },
  Bangkok: { city: 'Bangkok', country: 'Thailand', timeZone: 'Asia/Bangkok', latitude: 13.7563, longitude: 100.5018 },
  Barcelona: { city: 'Barcelona', country: 'Spain', timeZone: 'Europe/Madrid', latitude: 41.3874, longitude: 2.1686 },
  Berlin: { city: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', latitude: 52.52, longitude: 13.405 },
  Bogotá: { city: 'Bogotá', country: 'Colombia', timeZone: 'America/Bogota', latitude: 4.711, longitude: -74.0721 },
  Brasília: { city: 'Brasília', country: 'Brazil', timeZone: 'America/Sao_Paulo', latitude: -15.7939, longitude: -47.8828 },
  'Buenos Aires': { city: 'Buenos Aires', country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires', latitude: -34.6037, longitude: -58.3816 },
  Chicago: { city: 'Chicago', country: 'United States', timeZone: 'America/Chicago', latitude: 41.8781, longitude: -87.6298 },
  Dubai: { city: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', latitude: 25.2048, longitude: 55.2708 },
  Lisbon: { city: 'Lisbon', country: 'Portugal', timeZone: 'Europe/Lisbon', latitude: 38.7223, longitude: -9.1393 },
  London: { city: 'London', country: 'United Kingdom', timeZone: 'Europe/London', latitude: 51.5072, longitude: -0.1276 },
  'Mexico City': { city: 'Mexico City', country: 'Mexico', timeZone: 'America/Mexico_City', latitude: 19.4326, longitude: -99.1332 },
  Miami: { city: 'Miami', country: 'United States', timeZone: 'America/New_York', latitude: 25.7617, longitude: -80.1918 },
  'New York': { city: 'New York', country: 'United States', timeZone: 'America/New_York', latitude: 40.7128, longitude: -74.006 },
  Paris: { city: 'Paris', country: 'France', timeZone: 'Europe/Paris', latitude: 48.8566, longitude: 2.3522 },
  'Rio de Janeiro': { city: 'Rio de Janeiro', country: 'Brazil', timeZone: 'America/Sao_Paulo', latitude: -22.9068, longitude: -43.1729 },
  'São Paulo': { city: 'São Paulo', country: 'Brazil', timeZone: 'America/Sao_Paulo', latitude: -23.5505, longitude: -46.6333 },
  Singapore: { city: 'Singapore', country: 'Singapore', timeZone: 'Asia/Singapore', latitude: 1.3521, longitude: 103.8198 },
  Tokyo: { city: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo', latitude: 35.6762, longitude: 139.6503 },
  Toronto: { city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto', latitude: 43.6532, longitude: -79.3832 },
}

export const travelLocations = Object.keys(travelLocationProfiles)

export function findTravelLocation(city: string): Location | undefined {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  return Object.values(travelLocationProfiles).find((location) => normalize(location.city) === normalize(city))
}

export type GeneratedTripInput = {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  route?: TripRoute
}

function stableNumber(value: string): number {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7)
}

function generatedLocation(city: string, seed: number): Location {
  const knownLocation = travelLocationProfiles[city]
  if (knownLocation) return knownLocation
  return {
    city,
    country: 'Fictional location profile',
    timeZone: 'UTC',
    latitude: ((seed % 14000) / 100) - 70,
    longitude: (((seed >>> 8) % 34000) / 100) - 170,
  }
}

export function createGeneratedTripScenario(input: GeneratedTripInput): TripScenario {
  const seed = stableNumber(`${input.origin}|${input.destination}|${input.departureDate}|${input.returnDate}`)
  const route = input.route ?? { origin: generatedLocation(input.origin, seed), destination: generatedLocation(input.destination, seed >>> 4) }
  const nights = Math.max(1, Math.round((Date.parse(`${input.returnDate}T00:00:00Z`) - Date.parse(`${input.departureDate}T00:00:00Z`)) / 86_400_000))
  const baseFlight = 850 + seed % 500
  const baseHotel = 130 + (seed >>> 9) % 55
  const duration = 360 + (seed >>> 17) % 380
  const departure = `${input.departureDate}T07:30:00Z`
  const arrival = `${input.departureDate}T${String(11 + seed % 4).padStart(2, '0')}:20:00Z`
  const returnDeparture = `${input.returnDate}T18:10:00Z`
  const returnArrival = `${input.returnDate}T23:40:00Z`
  const prefix = `generated-${seed}`
  return {
    id: prefix,
    traveler: { firstName: 'Gustavo' },
    request: { naturalLanguage: `Plan a fictional trip for Gustavo from ${input.origin} to ${input.destination}.`, route, departureDate: input.departureDate, returnDate: input.returnDate, arriveBefore: `${input.departureDate}T15:00:00Z`, directFlightsPreferred: true },
    agenda: [{ id: `${prefix}-agenda`, title: 'Fictional business meeting', startsAt: `${input.departureDate}T16:00:00Z`, endsAt: `${input.departureDate}T17:30:00Z` }],
    budget: { currency: 'USD', limit: 3000 },
    policy: { maxHotelNightlyRateUsd: 230, permittedCabins: ['economy', 'premiumEconomy'], approvalRequiredBeforeSimulatedBooking: true, approvalRequiredForExceptions: true },
    flightOptions: [
      { id: `${prefix}-value`, label: 'Value direct flight', cabin: 'economy', roundTripPriceUsd: baseFlight, outbound: { departsAt: departure, arrivesAt: arrival, durationMinutes: duration, stops: 0 }, return: { departsAt: returnDeparture, arrivesAt: returnArrival, durationMinutes: duration, stops: 0 } },
      { id: `${prefix}-comfort`, label: 'Comfort direct flight', cabin: 'premiumEconomy', roundTripPriceUsd: baseFlight + 480, outbound: { departsAt: departure, arrivesAt: `${input.departureDate}T12:00:00Z`, durationMinutes: duration - 35, stops: 0 }, return: { departsAt: returnDeparture, arrivesAt: returnArrival, durationMinutes: duration - 35, stops: 0 } },
      { id: `${prefix}-arrival`, label: 'Early arrival direct flight', cabin: 'economy', roundTripPriceUsd: baseFlight + 220, outbound: { departsAt: `${input.departureDate}T05:45:00Z`, arrivesAt: `${input.departureDate}T09:20:00Z`, durationMinutes: duration, stops: 0 }, return: { departsAt: returnDeparture, arrivesAt: returnArrival, durationMinutes: duration, stops: 0 } },
    ],
    hotelOptions: [
      { id: `${prefix}-essential`, label: 'Essential business stay', locationSummary: 'Central business district', comfort: 'essential', checkInDate: input.departureDate, checkOutDate: input.returnDate, nights, nightlyRateUsd: baseHotel },
      { id: `${prefix}-standard`, label: 'Standard city stay', locationSummary: 'Connected city district', comfort: 'standard', checkInDate: input.departureDate, checkOutDate: input.returnDate, nights, nightlyRateUsd: baseHotel + 40 },
      { id: `${prefix}-enhanced`, label: 'Enhanced business stay', locationSummary: 'Conference district', comfort: 'enhanced', checkInDate: input.departureDate, checkOutDate: input.returnDate, nights, nightlyRateUsd: baseHotel + 90 },
    ],
    alternatives: [
      { id: `${prefix}-lowest-cost`, priority: 'lowestCost', label: 'Lowest cost', flightOptionId: `${prefix}-value`, hotelOptionId: `${prefix}-essential` },
      { id: `${prefix}-highest-comfort`, priority: 'highestComfort', label: 'Highest comfort', flightOptionId: `${prefix}-comfort`, hotelOptionId: `${prefix}-enhanced` },
      { id: `${prefix}-earliest-arrival`, priority: 'earliestArrival', label: 'Earliest arrival', flightOptionId: `${prefix}-arrival`, hotelOptionId: `${prefix}-standard` },
    ],
    initialTripState: { status: 'pending', selectedAlternativeId: null },
  }
}

export function calculateAlternativeTotal(scenario: TripScenario, alternative: TravelAlternative): number {
  const flight = scenario.flightOptions.find(({ id }) => id === alternative.flightOptionId)
  const hotel = scenario.hotelOptions.find(({ id }) => id === alternative.hotelOptionId)

  if (!flight || !hotel) {
    throw new Error(`Unknown flight or hotel option in alternative: ${alternative.id}`)
  }

  return flight.roundTripPriceUsd + hotel.nightlyRateUsd * hotel.nights
}
