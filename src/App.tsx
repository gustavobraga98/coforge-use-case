import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AssistantPanel } from './components/AssistantPanel'
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
  evaluateTraditionalFlightOptions,
  type TraditionalFlightFilters,
} from './components/traditionalFlightFilters'
import { createTraditionalPlanSummary } from './components/traditionalPlanSummary'
import { Badge, Button, Card, Surface } from './components/ui'
import { RouteMapPreview } from './components/RouteMapPreview'
import { TripContextSummary } from './components/TripContextSummary'
import { atlasTravelScenario } from './data/tripScenario'
import './styles/app.css'

const GlobeWorkspace = lazy(() =>
  import('./components/GlobeWorkspace').then(({ GlobeWorkspace }) => ({ default: GlobeWorkspace })),
)

function createInitialTraditionalSearchCriteria(): TraditionalSearchCriteria {
  return {
    traveler: atlasTravelScenario.traveler.firstName,
    origin: atlasTravelScenario.request.route.origin.city,
    destination: atlasTravelScenario.request.route.destination.city,
    departureDate: atlasTravelScenario.request.departureDate,
    returnDate: atlasTravelScenario.request.returnDate,
  }
}

function matchesCanonicalTraditionalSearch(
  criteria: TraditionalSearchCriteria,
): boolean {
  const request = atlasTravelScenario.request
  const normalizePlace = (value: string) => value.trim().toLocaleLowerCase()

  return criteria.traveler === atlasTravelScenario.traveler.firstName
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
  const [traditionalSearchCriteria, setTraditionalSearchCriteria] = useState<TraditionalSearchCriteria>(() =>
    createInitialTraditionalSearchCriteria(),
  )
  const [traditionalSearchState, setTraditionalSearchState] = useState<'form' | 'searching' | 'results'>('form')
  const [traditionalFlightFilters, setTraditionalFlightFilters] = useState<TraditionalFlightFilters>(() =>
    createInitialTraditionalFlightFilters(),
  )
  const [traditionalResultsTab, setTraditionalResultsTab] = useState<TraditionalResultsTab>('flights')
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [traditionalConfirmationState, setTraditionalConfirmationState] = useState<'results' | 'review' | 'confirmed'>('results')
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const route = atlasTravelScenario.request.route
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
    setSelectedFlightId(null)
    setSelectedHotelId(null)
    setTraditionalConfirmationState('results')
    setTraditionalSearchState('searching')
    searchTimeout.current = setTimeout(() => {
      setTraditionalSearchState('results')
      searchTimeout.current = null
    }, 500)
  }

  function updateTraditionalFlightFilters(filters: TraditionalFlightFilters) {
    setTraditionalFlightFilters(filters)
    setSelectedFlightId((flightId) => {
      if (flightId === null) {
        return null
      }

      const selectedFlight = evaluateTraditionalFlightOptions(atlasTravelScenario, filters)
        .find(({ flight }) => flight.id === flightId)

      return selectedFlight?.isEligible ? flightId : null
    })
  }

  function selectTraditionalFlight(flightId: string) {
    setSelectedFlightId(flightId)
    setTraditionalResultsTab('stays')
  }

  function selectTraditionalHotel(hotelId: string) {
    setSelectedHotelId(hotelId)
  }

  function reviewTraditionalPlan() {
    const summary = createTraditionalPlanSummary(atlasTravelScenario, selectedFlightId, selectedHotelId)

    if (summary.state === 'withinPolicy') {
      setTraditionalConfirmationState('review')
    }
  }

  function confirmTraditionalPlan() {
    const summary = createTraditionalPlanSummary(atlasTravelScenario, selectedFlightId, selectedHotelId)

    if (summary.state === 'withinPolicy') {
      setTraditionalConfirmationState('confirmed')
    }
  }

  function restoreCanonicalTraditionalSearch() {
    setTraditionalSearchCriteria(createInitialTraditionalSearchCriteria())
    setTraditionalFlightFilters(createInitialTraditionalFlightFilters())
    setTraditionalResultsTab('flights')
    setSelectedFlightId(null)
    setSelectedHotelId(null)
    setTraditionalConfirmationState('results')
    setTraditionalSearchState('form')
  }

  function startAnotherTraditionalPlan() {
    setSelectedFlightId(null)
    setSelectedHotelId(null)
    setTraditionalConfirmationState('results')
    setTraditionalSearchState('form')
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
            onClick={() => setAssistantEnabled((enabled) => !enabled)}
          >
            <span>AI Assistant</span>
            <span className="assistant-toggle__state" aria-hidden="true">{assistantEnabled ? 'On' : 'Off'}</span>
            <span className="switch-track" aria-hidden="true"><span /></span>
          </Button>
        </div>
      </header>

      <div className={`workspace ${assistantEnabled ? 'workspace--assisted' : 'workspace--traditional'}${isTaskFocused ? ' workspace--task-focused' : ''}`}>
        {!isTaskFocused && (
          <Suspense fallback={<div className="globe-loading" role="status">Loading interactive globe…</div>}>
            <GlobeWorkspace route={route} assistantEnabled={assistantEnabled} />
          </Suspense>
        )}

        {!isTaskFocused && <Surface as="aside" className="planning-rail planning-rail--left" label="Route overview">
          <div className="rail-heading">
            <h1>Route overview</h1>
            <Badge>Simulated route</Badge>
          </div>
          <Card className="mini-map-card" label="Map preview of the simulated route">
            <RouteMapPreview route={route} />
            <p className="map-caption">{route.origin.city} <span>→</span> {route.destination.city}</p>
          </Card>
          <div className="itinerary-preview" role="group" aria-label="Simulated itinerary preview">
            <div className="itinerary-line" aria-hidden="true" />
            <Card className="itinerary-stop" label="Origin">
              <span className="stop-dot" aria-hidden="true" />
              <span className="stop-caption">Origin</span>
              <strong>{route.origin.city}</strong>
            </Card>
            <div className="itinerary-leg"><span aria-hidden="true">↗</span> Simulated route</div>
            <Card className="itinerary-stop" label="Destination">
              <span className="stop-dot" aria-hidden="true" />
              <span className="stop-caption">Destination</span>
              <strong>{route.destination.city}</strong>
            </Card>
          </div>
        </Surface>}

        <Surface as="aside" className="planning-rail planning-rail--right" label="Planning workspace">
          {!isTaskFocused && <TripContextSummary
              scenario={atlasTravelScenario}
              status={assistantEnabled
                ? 'planning'
                : traditionalConfirmationState === 'confirmed'
                  ? 'confirmed'
                  : traditionalConfirmationState === 'review'
                    ? 'readyToBook'
                    : isTraditionalSearchActive
                      ? 'planning'
                      : atlasTravelScenario.initialTripState.status}
            />}
          {isTaskFocused && <TraditionalPlanningProgress currentStep={currentPlanningStep} />}
          {assistantEnabled ? (
            <AssistantPanel scenario={atlasTravelScenario} />
          ) : traditionalConfirmationState === 'review' ? (
            <TraditionalPlanConfirmation
              scenario={atlasTravelScenario}
              selectedFlightId={selectedFlightId}
              selectedHotelId={selectedHotelId}
              state="review"
              onBackToOptions={() => setTraditionalConfirmationState('results')}
              onConfirm={confirmTraditionalPlan}
              onStartAnotherPlan={startAnotherTraditionalPlan}
            />
          ) : traditionalConfirmationState === 'confirmed' ? (
            <TraditionalPlanConfirmation
              scenario={atlasTravelScenario}
              selectedFlightId={selectedFlightId}
              selectedHotelId={selectedHotelId}
              state="confirmed"
              onBackToOptions={() => setTraditionalConfirmationState('results')}
              onConfirm={() => setTraditionalConfirmationState('confirmed')}
              onStartAnotherPlan={startAnotherTraditionalPlan}
            />
          ) : traditionalSearchState === 'results' ? (
            <TraditionalSearchResults
              scenario={atlasTravelScenario}
              criteria={traditionalSearchCriteria}
              filters={traditionalFlightFilters}
              activeTab={traditionalResultsTab}
              selectedFlightId={selectedFlightId}
              selectedHotelId={selectedHotelId}
              hasMatchingScenario={matchesCanonicalTraditionalSearch(traditionalSearchCriteria)}
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
              scenario={atlasTravelScenario}
              criteria={traditionalSearchCriteria}
              isSearching={traditionalSearchState === 'searching'}
              onCriteriaChange={setTraditionalSearchCriteria}
              onSubmit={searchTraditionalOptions}
            />
          )}
        </Surface>

        {isTaskFocused && (
          <Surface as="aside" className="planning-rail planning-rail--summary" label="Current plan summary">
            <TripContextSummary
              compact
              scenario={atlasTravelScenario}
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
