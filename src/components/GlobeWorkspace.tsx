import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import type { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { TripRoute } from '../data/tripScenario'

// This local route serves MapLibre's worker together with its sibling shared module.
// Next.js emits the worker but not that sibling, which makes module-worker loading
// fail in development.
maplibregl.setWorkerUrl('/api/maplibre-worker/maplibre-gl-worker.mjs')

type GlobeWorkspaceProps = {
  route: TripRoute | null
  assistantEnabled: boolean
  compact?: boolean
}

export function GlobeWorkspace({ route, assistantEnabled, compact = false }: GlobeWorkspaceProps) {
  const mapElement = useRef<HTMLDivElement>(null)
  const map = useRef<Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const [mapUnavailable, setMapUnavailable] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapElement.current || map.current) return
    let cancelled = false
    void fetch('/api/map/config').then(async (response) => response.ok ? response.json() as Promise<{ styleUrl: string | null; available: boolean }> : null).then((configuration) => {
      if (cancelled || !mapElement.current) return
      // A local base map still gives the route a usable spatial fallback while Geoapify is unavailable.
      const instance = new maplibregl.Map({
        container: mapElement.current,
        style: configuration?.styleUrl ?? { version: 8, projection: { type: 'globe' }, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#071522' } }] },
        center: [0, 16],
        zoom: 1.15,
        interactive: !compact,
        attributionControl: false,
      })
      instance.addControl(new maplibregl.NavigationControl({ showCompass: !compact }), 'top-right')
      instance.on('error', () => setMapUnavailable(true))
      instance.on('load', () => {
        instance.setProjection({ type: 'globe' })
        instance.resize()
        setMapReady(true)
      })
      map.current = instance
    }).catch(() => setMapUnavailable(true))
    return () => { cancelled = true; map.current?.remove(); map.current = null }
  }, [compact])

  useEffect(() => {
    const currentMap = map.current
    if (!currentMap || !route) return
    const draw = () => {
      const from: [number, number] = [route.origin.longitude, route.origin.latitude]
      const to: [number, number] = [route.destination.longitude, route.destination.latitude]
      const data = { type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: [from, to] } }
      const source = currentMap.getSource('simulated-flight') as maplibregl.GeoJSONSource | undefined
      if (source) source.setData(data)
      else { currentMap.addSource('simulated-flight', { type: 'geojson', data }); currentMap.addLayer({ id: 'simulated-flight', type: 'line', source: 'simulated-flight', paint: { 'line-color': '#57e5f1', 'line-width': compact ? 2 : 3 } }) }
      markers.current.forEach((marker) => marker.remove())
      markers.current = [route.origin, route.destination].map((location) => {
        const markerElement = document.createElement('span')
        markerElement.className = 'map-waypoint'
        markerElement.setAttribute('aria-label', location.city)
        return new maplibregl.Marker({ element: markerElement }).setLngLat([location.longitude, location.latitude]).addTo(currentMap)
      })
      currentMap.fitBounds([from, to], { padding: compact ? 36 : 100, duration: 650, maxZoom: compact ? 3 : 4 })
    }
    if (currentMap.loaded()) {
      draw()
    } else {
      currentMap.once('load', draw)
    }
  }, [route, compact, mapReady])

  return (
    <section className={`globe-workspace ${assistantEnabled ? 'globe-workspace--assisted' : ''}${compact ? ' globe-workspace--compact' : ''}`} aria-label={route ? `Interactive globe showing a simulated ${route.origin.city} to ${route.destination.city} route` : 'Interactive globe ready for a simulated route selection'}>
      <div className="map-canvas" ref={mapElement} />
      {mapUnavailable && <p className="map-status" role="status">Map unavailable — planning remains simulated.</p>}
      <p className="globe-instruction">{route ? 'Illustrative air route · Map locations are real' : 'Choose a route to map it'}</p>
    </section>
  )
}
