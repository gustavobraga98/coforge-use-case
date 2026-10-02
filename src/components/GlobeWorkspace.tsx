import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import Globe from 'react-globe.gl'
import type { TripRoute } from '../data/tripScenario'

function getDimensions() {
  const narrow = window.innerWidth <= 650
  return {
    width: narrow ? window.innerWidth : Math.min(window.innerWidth, 1150),
    height: narrow ? 400 : Math.max(720, window.innerHeight - 72),
  }
}

type GlobeWorkspaceProps = {
  route: TripRoute
  assistantEnabled: boolean
}

export function GlobeWorkspace({ route, assistantEnabled }: GlobeWorkspaceProps) {
  const globeRef = useRef<ComponentRef<typeof Globe> | undefined>(undefined)
  const [dimensions, setDimensions] = useState(getDimensions)
  const initialView = useMemo(() => ({
    lat: (route.origin.latitude + route.destination.latitude) / 2,
    lng: (route.origin.longitude + route.destination.longitude) / 2,
    altitude: 1.55,
  }), [route])
  const arcs = [{
    startLat: route.origin.latitude,
    startLng: route.origin.longitude,
    endLat: route.destination.latitude,
    endLng: route.destination.longitude,
  }]
  const places = [route.origin, route.destination].map(({ city, latitude, longitude }) => ({
    name: city,
    lat: latitude,
    lng: longitude,
  }))

  useEffect(() => {
    const updateDimensions = () => setDimensions(getDimensions())
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => globeRef.current?.pointOfView(initialView, 0), 500)
    return () => window.clearTimeout(timer)
  }, [initialView])

  function changeZoom(direction: 'in' | 'out') {
    const current = globeRef.current?.pointOfView()
    if (!current) return
    const altitude = Math.max(0.7, Math.min(3, current.altitude + (direction === 'in' ? -0.3 : 0.3)))
    globeRef.current?.pointOfView({ ...current, altitude }, 450)
  }

  return (
    <section className={`globe-workspace ${assistantEnabled ? 'globe-workspace--assisted' : ''}`} aria-label={`Interactive globe showing an illustrative ${route.origin.city} to ${route.destination.city} route`}>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="/assets/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor={assistantEnabled ? '#65dce9' : '#48c8e4'}
        atmosphereAltitude={assistantEnabled ? 0.13 : 0.1}
        arcsData={arcs}
        arcColor={() => assistantEnabled ? '#8af3f4' : '#57e5f1'}
        arcAltitude={assistantEnabled ? 0.3 : 0.25}
        arcStroke={assistantEnabled ? 0.9 : 0.7}
        arcDashLength={1}
        arcDashGap={0}
        pointsData={places}
        pointLat="lat"
        pointLng="lng"
        pointLabel="name"
        pointColor={() => '#f4c66d'}
        pointAltitude={0.025}
        pointRadius={0.65}
      />
      <div className="globe-controls" aria-label="Globe controls">
        <button className="center-control" type="button" onClick={() => globeRef.current?.pointOfView(initialView, 450)} aria-label="Center route on globe">Center</button>
        <button type="button" onClick={() => changeZoom('in')} aria-label="Zoom in on globe">+</button>
        <button type="button" onClick={() => changeZoom('out')} aria-label="Zoom out on globe">−</button>
      </div>
      <p className="globe-instruction">Drag to rotate · Scroll to zoom</p>
    </section>
  )
}
