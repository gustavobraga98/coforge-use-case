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
import {
  createInitialTraditionalFlightFilters,
  type TraditionalFlightFilters,
} from './components/traditionalFlightFilters'
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
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const route = atlasTravelScenario.request.route
  const isTraditionalSearchActive = traditionalSearchState !== 'form'

  useEffect(() => () => {
    if (searchTimeout.current !== null) {
      clearTimeout(searchTimeout.current)
    }
  }, [])

  function searchTraditionalOptions() {
    setTraditionalSearchState('searching')
    searchTimeout.current = setTimeout(() => {
      setTraditionalSearchState('results')
      searchTimeout.current = null
    }, 500)
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

      <div className={`workspace ${assistantEnabled ? 'workspace--assisted' : 'workspace--traditional'}`}>
        <Suspense fallback={<div className="globe-loading" role="status">Loading interactive globe…</div>}>
          <GlobeWorkspace route={route} assistantEnabled={assistantEnabled} />
        </Suspense>

        <Surface as="aside" className="planning-rail planning-rail--left" label="Route overview">
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
        </Surface>

        <Surface as="aside" className="planning-rail planning-rail--right" label="Planning panels">
          <TripContextSummary
            scenario={atlasTravelScenario}
            status={assistantEnabled || isTraditionalSearchActive ? 'planning' : atlasTravelScenario.initialTripState.status}
          />
          {assistantEnabled ? (
            <AssistantPanel scenario={atlasTravelScenario} />
          ) : traditionalSearchState === 'results' ? (
            <TraditionalSearchResults
              scenario={atlasTravelScenario}
              criteria={traditionalSearchCriteria}
              filters={traditionalFlightFilters}
              activeTab={traditionalResultsTab}
              onFiltersChange={setTraditionalFlightFilters}
              onActiveTabChange={setTraditionalResultsTab}
              onModifySearch={() => setTraditionalSearchState('form')}
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
      </div>
    </main>
  )
}
