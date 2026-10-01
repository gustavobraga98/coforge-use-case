import { lazy, Suspense } from 'react'
import { Badge, Button, Card, Surface } from './components/ui'
import { RouteMapPreview } from './components/RouteMapPreview'
import './styles/app.css'

const GlobeWorkspace = lazy(() =>
  import('./components/GlobeWorkspace').then(({ GlobeWorkspace }) => ({ default: GlobeWorkspace })),
)

export default function App() {
  return (
    <main className="application-shell" id="workspace">
      <header className="application-header">
        <a className="brand" href="#workspace" aria-label="Atlas Travel home">
          <span className="brand-orbit" aria-hidden="true" />
          <span>Atlas <span className="brand-light">Travel</span></span>
        </a>
        <div className="header-actions">
          <Badge tone="muted">Demonstration</Badge>
          <Button className="assistant-toggle" tone="quiet" type="button" disabled aria-label="AI Assistant is unavailable in this preview">
            <span>Assistente IA</span>
            <span className="switch-track" aria-hidden="true"><span /></span>
          </Button>
        </div>
      </header>

      <div className="workspace">
        <Suspense fallback={<div className="globe-loading" role="status">Loading interactive globe…</div>}>
          <GlobeWorkspace />
        </Suspense>

        <Surface as="aside" className="planning-rail planning-rail--left" label="Route overview">
          <div className="rail-heading">
            <h1>Route overview</h1>
            <Badge>Illustrative</Badge>
          </div>
          <Card className="mini-map-card" label="Map preview of the simulated route">
            <RouteMapPreview />
            <p className="map-caption">São Paulo <span>→</span> New York</p>
          </Card>
          <div className="itinerary-preview" aria-label="Illustrative itinerary preview">
            <div className="itinerary-line" aria-hidden="true" />
            <Card className="itinerary-stop" label="Origin">
              <span className="stop-dot" aria-hidden="true" />
              <span className="stop-caption">Origin</span>
              <strong>São Paulo</strong>
            </Card>
            <div className="itinerary-leg"><span aria-hidden="true">↗</span> Simulated route</div>
            <Card className="itinerary-stop" label="Destination">
              <span className="stop-dot" aria-hidden="true" />
              <span className="stop-caption">Destination</span>
              <strong>New York</strong>
            </Card>
          </div>
        </Surface>

        <Surface as="aside" className="planning-rail planning-rail--right" label="Planning panels">
          <div className="rail-heading">
            <h2>Planning panels</h2>
            <Badge tone="muted">Preview</Badge>
          </div>
          <Card className="route-display" label="Route display">
            <RouteMapPreview caption="Route display" regional />
          </Card>
          <Card className="metric-display" label="Planning information placeholder">
            <span>Flight options</span><Badge tone="muted">Pending</Badge>
          </Card>
          <Card className="metric-display" label="Budget information placeholder">
            <span>Budget overview</span><Badge tone="muted">Pending</Badge>
          </Card>
          <Card className="metric-display" label="Policy information placeholder">
            <span>Policy status</span><Badge tone="muted">Pending</Badge>
          </Card>
          <Card className="horizon-card" label="Earth horizon image" />
          <p className="rail-note">Trip details will populate these panels in the next stage.</p>
        </Surface>
      </div>
    </main>
  )
}
