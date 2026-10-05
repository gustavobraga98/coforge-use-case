import { z } from 'zod'
import { atlasTravelScenarios, createGeneratedTripScenario, type TripRoute, type TripScenario } from '../data/tripScenario'
import { createInitialTraditionalFlightFilters, evaluateTraditionalFlightOptions, type TraditionalFlightFilters } from '../components/traditionalFlightFilters'
import { createTraditionalPlanSummary } from '../components/traditionalPlanSummary'

export const periodSchema = z.object({ departureDate: z.iso.date(), returnDate: z.iso.date() })
  .refine((value) => value.returnDate > value.departureDate, 'Return must be after departure.')
export const constraintsSchema = z.object({
  directOnly: z.boolean().optional(),
  arrivalBeforeRequestedTime: z.boolean().optional(),
  maxPriceUsd: z.number().nonnegative().nullable().optional(),
  budgetUsd: z.number().positive().optional(),
  arrivalTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
})
export type PlanConstraints = z.infer<typeof constraintsSchema>
export type AssistantPlanState = {
  revision: number
  route: TripRoute | null
  period: z.infer<typeof periodSchema> | null
  scenario: TripScenario | null
  filters: TraditionalFlightFilters
  budgetUsd: number | null
  arrivalTime: string | null
  selectedFlightId: string | null
  selectedHotelId: string | null
  status: 'planning' | 'review' | 'confirmed'
}
export type PlanStage = 'route' | 'dates' | 'flights' | 'stays' | 'review' | 'confirmation' | 'confirmed'
export type PlanAction =
  | { type: 'setRoute'; route: TripRoute }
  | { type: 'confirmDates'; period: z.infer<typeof periodSchema> }
  | { type: 'requestDates' }
  | { type: 'setConstraints'; constraints: PlanConstraints }
  | { type: 'selectFlight'; id: string }
  | { type: 'selectHotel'; id: string }
  | { type: 'requestReview' }
  | { type: 'confirmSimulatedPlan'; revision: number }
  | { type: 'backToOptions' }
  | { type: 'reset' }

export function initialPlan(): AssistantPlanState {
  return { revision: 0, route: null, period: null, scenario: null, filters: createInitialTraditionalFlightFilters(), budgetUsd: null, arrivalTime: null, selectedFlightId: null, selectedHotelId: null, status: 'planning' }
}

function rebuild(state: AssistantPlanState): AssistantPlanState {
  if (!state.route || !state.period) return { ...state, scenario: null }
  const { route, period } = state
  const canonical = atlasTravelScenarios.find(({ request }) => request.route.origin.city === route.origin.city && request.route.destination.city === route.destination.city && request.departureDate === period.departureDate && request.returnDate === period.returnDate)
  const base = canonical ?? createGeneratedTripScenario({ origin: route.origin.city, destination: route.destination.city, ...period, route })
  const scenario = {
    ...base,
    budget: { ...base.budget, limit: state.budgetUsd ?? base.budget.limit },
    request: { ...base.request, directFlightsPreferred: state.filters.directOnly, arriveBefore: state.arrivalTime ? `${period.departureDate}T${state.arrivalTime}:00Z` : base.request.arriveBefore },
  }
  return { ...state, scenario }
}

export function applyPlanAction(state: AssistantPlanState, action: PlanAction): AssistantPlanState {
  let next = { ...state, revision: state.revision + 1 }
  if (action.type === 'reset') return { ...initialPlan(), revision: next.revision }
  if (action.type === 'requestDates') return { ...next, period: null, scenario: null, selectedFlightId: null, selectedHotelId: null, status: 'planning' }
  if (action.type === 'setRoute') {
    if (JSON.stringify(state.route) === JSON.stringify(action.route)) return state
    return rebuild({ ...next, route: action.route, selectedFlightId: null, selectedHotelId: null, status: 'planning' })
  }
  if (action.type === 'confirmDates') {
    const period = periodSchema.parse(action.period)
    if (JSON.stringify(state.period) === JSON.stringify(period)) return state
    return rebuild({ ...next, period, selectedFlightId: null, selectedHotelId: null, status: 'planning' })
  }
  if (action.type === 'setConstraints') {
    const constraints = constraintsSchema.parse(action.constraints)
    const { budgetUsd, arrivalTime, ...filters } = constraints
    next = rebuild({ ...next, filters: { ...state.filters, ...filters }, budgetUsd: budgetUsd ?? state.budgetUsd, arrivalTime: arrivalTime ?? state.arrivalTime, status: 'planning' })
    if (next.scenario && !evaluateTraditionalFlightOptions(next.scenario, next.filters).some(({ flight, isEligible }) => flight.id === next.selectedFlightId && isEligible)) next.selectedFlightId = null
    return next
  }
  if (action.type === 'backToOptions') return { ...next, status: 'planning' }
  if (!state.scenario || !state.period) throw new Error('Confirm the route and dates first.')
  if (action.type === 'selectFlight') {
    if (!evaluateTraditionalFlightOptions(state.scenario, state.filters).some(({ flight, isEligible }) => flight.id === action.id && isEligible)) throw new Error('This flight is not eligible for the current plan.')
    return { ...next, selectedFlightId: action.id, status: 'planning' }
  }
  if (action.type === 'selectHotel') {
    if (!state.scenario.hotelOptions.some(({ id }) => id === action.id)) throw new Error('This stay is no longer available in the simulated plan.')
    return { ...next, selectedHotelId: action.id, status: 'planning' }
  }
  const summary = createTraditionalPlanSummary(state.scenario, state.selectedFlightId, state.selectedHotelId)
  if (summary.state !== 'withinPolicy') throw new Error('Select eligible items and resolve policy alerts before reviewing the plan.')
  if (action.type === 'requestReview') return { ...next, status: 'review' }
  if (state.status !== 'review' || action.revision !== state.revision) throw new Error('The plan changed. Review it again before confirming.')
  return { ...next, status: 'confirmed' }
}

export function planSnapshot(state: AssistantPlanState) {
  return { ...state, datesConfirmed: state.period !== null, summary: state.scenario ? createTraditionalPlanSummary(state.scenario, state.selectedFlightId, state.selectedHotelId) : null }
}

/** The only assistant action that may be offered for the current plan state. */
export function planStage(state: AssistantPlanState): PlanStage {
  if (!state.route) return 'route'
  if (!state.period) return 'dates'
  if (!state.selectedFlightId) return 'flights'
  if (!state.selectedHotelId) return 'stays'
  if (state.status === 'planning') return 'review'
  if (state.status === 'review') return 'confirmation'
  return 'confirmed'
}
