import { useEffect, useRef, useState, type ComponentRef } from 'react'
import Globe from 'react-globe.gl'

const route = [{ startLat: -23.5505, startLng: -46.6333, endLat: 40.7128, endLng: -74.006 }]
const places = [
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'New York', lat: 40.7128, lng: -74.006 },
]

const initialView = { lat: 8, lng: -61, altitude: 1.55 }

function getDimensions() {
  const narrow = window.innerWidth <= 650
  return {
    width: narrow ? window.innerWidth : Math.min(window.innerWidth, 1150),
    height: narrow ? 400 : Math.max(720, window.innerHeight - 72),
  }
}

export function GlobeWorkspace() {
  const globeRef = useRef<ComponentRef<typeof Globe> | undefined>(undefined)
  const [dimensions, setDimensions] = useState(getDimensions)

  useEffect(() => {
    const updateDimensions = () => setDimensions(getDimensions())
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => globeRef.current?.pointOfView(initialView, 0), 500)
    return () => window.clearTimeout(timer)
  }, [])

  function changeZoom(direction: 'in' | 'out') {
    const current = globeRef.current?.pointOfView()
    if (!current) return
    const altitude = Math.max(0.7, Math.min(3, current.altitude + (direction === 'in' ? -0.3 : 0.3)))
    globeRef.current?.pointOfView({ ...current, altitude }, 450)
  }

  return (
    <section className="globe-workspace" aria-label="Interactive globe showing an illustrative São Paulo to New York route">
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="/assets/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="#48c8e4"
        atmosphereAltitude={0.1}
        arcsData={route}
        arcColor={() => '#57e5f1'}
        arcAltitude={0.25}
        arcStroke={0.7}
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
