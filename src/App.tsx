import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AssistantPanel } from './components/AssistantPanel'
import { initialConversation } from './plan/agUiConversation'
import { useTravelPlan } from './plan/useTravelPlan'
import { TraditionalPlanCostSummary } from './components/TraditionalPlanCostSummary'
import {
  TraditionalSearchForm,
  type TraditionalSearchCriteria,
} from './components/TraditionalSearchForm'
import {
  TraditionalSearchResults,
  type TraditionalResultsTab,
} from './components/TraditionalSearchResults'
import { TraditionalPlanConfirmation } from './components/TraditionalPlanConfirmation'
import {
  createInitialTraditionalFlightFilters,
  type TraditionalFlightFilters,
} from './components/traditionalFlightFilters'
import { Badge, Button, Card, Surface } from './components/ui'
import { RouteMapPreview } from './components/RouteMapPreview'
import { TripContextSummary } from './components/TripContextSummary'
import { atlasTravelScenarios, atlasTravelScenario, createGeneratedTripScenario, type TripScenario } from './data/tripScenario'
import './styles/app.css'

const GlobeWorkspace = lazy(() =>
  import('./components/GlobeWorkspace').then(({ GlobeWorkspace }) => ({ default: GlobeWorkspace })),
)

function createInitialTraditionalSearchCriteria(scenario: TripScenario): TraditionalSearchCriteria {
  return {
    traveler: scenario.traveler.firstName,
    origin: scenario.request.route.origin.city,
    destination: scenario.request.route.destination.city,
    departureDate: scenario.request.departureDate,
    returnDate: scenario.request.returnDate,
  }
}

const initialTraditionalCriteria: TraditionalSearchCriteria = {
  traveler: 'Gustavo',
  origin: '',
  destination: '',
  departureDate: '2026-11-12',
  returnDate: '2026-11-16',
}

function matchesCanonicalTraditionalSearch(
  criteria: TraditionalSearchCriteria,
  scenario: TripScenario,
): boolean {
  const request = scenario.request
  const normalizePlace = (value: string) => value.trim().toLocaleLowerCase()

  return criteria.traveler === scenario.traveler.firstName
    && normalizePlace(criteria.origin) === normalizePlace(request.route.origin.city)
    && normalizePlace(criteria.destination) === normalizePlace(request.route.destination.city)
    && criteria.departureDate === request.departureDate
    && criteria.returnDate === request.returnDate
}

type TraditionalPlanningStep = 'search' | 'flight' | 'stay' | 'review'

const planningSteps: readonly { id: TraditionalPlanningStep; label: string }[] = [
  { id: 'search', label: 'Search' },
  { id: 'flight', label: 'Flight' },
  { id: 'stay', label: 'Stay' },
  { id: 'review', label: 'Review' },
]

function TraditionalPlanningProgress({ currentStep }: { currentStep: TraditionalPlanningStep }) {
  const currentIndex = planningSteps.findIndex(({ id }) => id === currentStep)

  return (
    <nav className="planning-progress" aria-label="Traditional planning progress">
      <ol>
        {planningSteps.map((step, index) => (
          <li
            key={step.id}
            className={index < currentIndex ? 'planning-progress__step--complete' : index === currentIndex ? 'planning-progress__step--current' : ''}
            aria-current={index === currentIndex ? 'step' : undefined}
          >
            <span aria-hidden="true">{index < currentIndex ? '✓' : index + 1}</span>
            <strong>{step.label}</strong>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function App() {
  const [assistantEnabled, setAssistantEnabled] = useState(false)
  const [assistantActivation, setAssistantActivation] = useState(0)
  const [conversation, setConversation] = useState(initialConversation)
  const { plan, dispatch, getPlan } = useTravelPlan()
  const [traditionalSearchCriteria, setTraditionalSearchCriteria] = useState<TraditionalSearchCriteria>(() =>
    initialTraditionalCriteria,
  )
  const [traditionalSearchState, setTraditionalSearchState] = useState<'form' | 'searching' | 'results'>('form')
  const traditionalFlightFilters = plan.filters
  const [traditionalResultsTab, setTraditionalResultsTab] = useState<TraditionalResultsTab>('flights')
  const selectedFlightId = plan.selectedFlightId
  const selectedHotelId = plan.selectedHotelId
  const traditionalConfirmationState = plan.status === 'planning' ? 'results' : plan.status
  const setTraditionalConfirmationState = (status: 'results' | 'review' | 'confirmed') => {
    dispatch(status === 'results' ? { type: 'backToOptions' } : status === 'review' ? { type: 'requestReview' } : { type: 'confirmSimulatedPlan', revision: getPlan().revision })
  }
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scenario = plan.scenario
  const activeScenario = scenario ?? atlasTravelScenario
  const route = plan.route
  const isTraditionalSearchActive = traditionalSearchState !== 'form'
  const isTaskFocused = !assistantEnabled && (traditionalSearchState === 'results' || traditionalConfirmationState !== 'results')
  const currentPlanningStep: TraditionalPlanningStep = traditionalConfirmationState !== 'results' || selectedHotelId !== null
    ? 'review'
    : selectedFlightId !== null
      ? 'stay'
      : traditionalSearchState === 'results'
        ? 'flight'
        : 'search'

  useEffect(() => () => {
    if (searchTimeout.current !== null) {
      clearTimeout(searchTimeout.current)
    }
  }, [])

  function searchTraditionalOptions() {
    updateTraditionalCriteria(traditionalSearchCriteria)
    setTraditionalSearchState('searching')
    searchTimeout.current = setTimeout(() => {
      setTraditionalSearchState('results')
      searchTimeout.current = null
    }, 500)
  }

  function updateTraditionalCriteria(nextCriteria: TraditionalSearchCriteria) {
    setTraditionalSearchCriteria(nextCriteria)
    if (!nextCriteria.origin || !nextCriteria.destination) {
      return
    }
    dispatch({ type: 'setRoute', route: createGeneratedTripScenario(nextCriteria).request.route })
    if (nextCriteria.departureDate && nextCriteria.returnDate > nextCriteria.departureDate) {
      dispatch({ type: 'confirmDates', period: { departureDate: nextCriteria.departureDate, returnDate: nextCriteria.returnDate } })
    }
  }

  function updateTraditionalFlightFilters(filters: TraditionalFlightFilters) {
    if (!scenario) return

    dispatch({ type: 'setConstraints', constraints: filters })
  }

  function selectTraditionalFlight(flightId: string) {
    dispatch({ type: 'selectFlight', id: flightId })
    setTraditionalResultsTab('stays')
  }

  function selectTraditionalHotel(hotelId: string) {
    dispatch({ type: 'selectHotel', id: hotelId })
  }

  function reviewTraditionalPlan() {
    if (!scenario) return

    dispatch({ type: 'requestReview' })
  }

  function confirmTraditionalPlan() {
    if (!scenario) return

    dispatch({ type: 'confirmSimulatedPlan', revision: getPlan().revision })
  }

  function restoreCanonicalTraditionalSearch() {
    if (!scenario) return

    setTraditionalSearchCriteria(createInitialTraditionalSearchCriteria(scenario))
    dispatch({ type: 'setConstraints', constraints: createInitialTraditionalFlightFilters() })
    setTraditionalResultsTab('flights')
    setTraditionalConfirmationState('results')
    setTraditionalSearchState('form')
  }

  function startAnotherTraditionalPlan() {
    dispatch({ type: 'reset' })
    setConversation(initialConversation())
    setTraditionalSearchCriteria(initialTraditionalCriteria)
    setTraditionalResultsTab('flights')
    setTraditionalConfirmationState('results')
    setTraditionalSearchState('form')
  }

  function toggleAssistant() {
    if (!assistantEnabled) {
      setAssistantActivation((activation) => activation + 1)
    }

    if (assistantEnabled && scenario) {
      setTraditionalSearchCriteria(createInitialTraditionalSearchCriteria(scenario))
      setTraditionalSearchState('results')
    }

    setAssistantEnabled(!assistantEnabled)
  }

  return (
    <main className={`application-shell ${assistantEnabled ? 'application-shell--assisted' : 'application-shell--traditional'}`} id="workspace">
      <header className="application-header">
        <a className="brand" href="#workspace" aria-label="Atlas Travel home">
          <span className="brand-orbit" aria-hidden="true" />
          <span>Atlas <span className="brand-light">Travel</span></span>
        </a>
        <div className="header-actions">
          <Badge tone="muted">Fictional demo</Badge>
          <Button
            className="assistant-toggle"
            tone="quiet"
            type="button"
            aria-label={`AI Assistant ${assistantEnabled ? 'on' : 'off'}`}
            aria-pressed={assistantEnabled}
            onClick={toggleAssistant}
          >
            <span>AI Assistant</span>
            <span className="assistant-toggle__state" aria-hidden="true">{assistantEnabled ? 'On' : 'Off'}</span>
            <span className="switch-track" aria-hidden="true"><span /></span>
          </Button>
        </div>
      </header>

      <div className={`workspace ${assistantEnabled ? `workspace--assisted workspace--assistant-activation-${assistantActivation}` : 'workspace--traditional'}${isTaskFocused ? ' workspace--task-focused' : ''}`}>
        {assistantEnabled && <span className="assistant-activation-scan" aria-hidden="true" />}
        {!isTaskFocused && (
          <Suspense fallback={<div className="globe-loading" role="status">Loading interactive globe…</div>}>
            <GlobeWorkspace route={route} assistantEnabled={assistantEnabled} />
          </Suspense>
        )}

        {!isTaskFocused && scenario && <Surface as="aside" className="planning-rail planning-rail--left" label="Route overview">
          <div className="rail-heading">
            <h1>Route overview</h1>
            <Badge>Simulated route</Badge>
          </div>
          <Card className="mini-map-card" label="Preview of the illustrative route">
            <RouteMapPreview route={scenario.request.route} />
            <p className="map-caption">{scenario.request.route.origin.city} <span>→</span> {scenario.request.route.destination.city}</p>
          </Card>
          {assistantEnabled && <TripContextSummary
            compact
            scenario={activeScenario}
            status={plan.status === 'confirmed' ? 'confirmed' : plan.status === 'review' ? 'readyToBook' : 'planning'}
          />}
          <div className="itinerary-preview" role="group" aria-label="Simulated itinerary preview">
            <div className="itinerary-line" aria-hidden="true" />
            <Card className="itinerary-stop" label="Origin">
              <span className="stop-dot" aria-hidden="true" />
              <span className="stop-caption">Origin</span>
              <strong>{scenario.request.route.origin.city}</strong>
            </Card>
            <div className="itinerary-leg"><span aria-hidden="true">↗</span> Simulated route</div>
            <Card className="itinerary-stop" label="Destination">
              <span className="stop-dot" aria-hidden="true" />
              <span className="stop-caption">Destination</span>
              <strong>{scenario.request.route.destination.city}</strong>
            </Card>
          </div>
          {assistantEnabled && <TraditionalPlanCostSummary scenario={scenario} selectedFlightId={selectedFlightId} selectedHotelId={selectedHotelId} />}
        </Surface>}

        <Surface as="aside" className="planning-rail planning-rail--right" label={assistantEnabled ? 'AI Assistant workspace' : 'Planning workspace'}>
          {!isTaskFocused && !assistantEnabled && scenario && <TripContextSummary
              scenario={activeScenario}
              status={assistantEnabled
                ? 'planning'
                : traditionalConfirmationState === 'confirmed'
                  ? 'confirmed'
                  : traditionalConfirmationState === 'review'
                    ? 'readyToBook'
                    : isTraditionalSearchActive
                      ? 'planning'
                    : activeScenario.initialTripState.status}
            />}
          {isTaskFocused && <TraditionalPlanningProgress currentStep={currentPlanningStep} />}
          {assistantEnabled ? (
            <AssistantPanel plan={plan} getPlan={getPlan} dispatch={dispatch} conversation={conversation} onConversationChange={setConversation} />
          ) : traditionalConfirmationState === 'review' ? (
            <TraditionalPlanConfirmation
              scenario={activeScenario}
              selectedFlightId={selectedFlightId}
              selectedHotelId={selectedHotelId}
              state="review"
              onBackToOptions={() => setTraditionalConfirmationState('results')}
              onConfirm={confirmTraditionalPlan}
              onStartAnotherPlan={startAnotherTraditionalPlan}
            />
          ) : traditionalConfirmationState === 'confirmed' ? (
            <TraditionalPlanConfirmation
              scenario={activeScenario}
              selectedFlightId={selectedFlightId}
              selectedHotelId={selectedHotelId}
              state="confirmed"
              onBackToOptions={() => setTraditionalConfirmationState('results')}
              onConfirm={() => setTraditionalConfirmationState('confirmed')}
              onStartAnotherPlan={startAnotherTraditionalPlan}
            />
          ) : traditionalSearchState === 'results' ? (
            <TraditionalSearchResults
              scenario={activeScenario}
              criteria={traditionalSearchCriteria}
              filters={traditionalFlightFilters}
              activeTab={traditionalResultsTab}
              selectedFlightId={selectedFlightId}
              selectedHotelId={selectedHotelId}
              hasMatchingScenario={matchesCanonicalTraditionalSearch(traditionalSearchCriteria, activeScenario)}
              onFiltersChange={updateTraditionalFlightFilters}
              onActiveTabChange={setTraditionalResultsTab}
              onFlightSelect={selectTraditionalFlight}
              onHotelSelect={selectTraditionalHotel}
              onModifySearch={() => setTraditionalSearchState('form')}
              onResetSearch={restoreCanonicalTraditionalSearch}
              onReviewPlan={reviewTraditionalPlan}
            />
          ) : (
            <TraditionalSearchForm
              scenarios={atlasTravelScenarios}
              criteria={traditionalSearchCriteria}
              isSearching={traditionalSearchState === 'searching'}
              onCriteriaChange={updateTraditionalCriteria}
              onSubmit={searchTraditionalOptions}
            />
          )}
        </Surface>

        {isTaskFocused && (
          <Surface as="aside" className="planning-rail planning-rail--summary" label="Current plan summary">
            <TripContextSummary
              compact
              scenario={activeScenario}
              status={traditionalConfirmationState === 'confirmed'
                ? 'confirmed'
                : traditionalConfirmationState === 'review'
                  ? 'readyToBook'
                  : 'planning'}
            />
          </Surface>
        )}

        {isTaskFocused && (
          <Suspense fallback={<div className="globe-loading" role="status">Loading route map…</div>}>
            <GlobeWorkspace route={route} assistantEnabled={assistantEnabled} compact />
          </Suspense>
        )}
      </div>
    </main>
  )
}
