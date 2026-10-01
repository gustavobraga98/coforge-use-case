type RouteMapPreviewProps = { caption?: string; regional?: boolean }

export function RouteMapPreview({ caption, regional = false }: RouteMapPreviewProps) {
  return (
    <div className={`route-map-preview ${regional ? 'route-map-preview--regional' : ''}`} role="img" aria-label="Illustrative route from São Paulo to New York over a real world map">
      <svg className="route-map-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={regional ? 'M 74 63 Q 57 47 58 27' : 'M 37 63 Q 24 47 29 27'} />
        <circle cx={regional ? 74 : 37} cy="63" r="1.8" />
        <circle cx={regional ? 58 : 29} cy="27" r="1.8" />
      </svg>
      {caption && <span className="route-map-caption">{caption}</span>}
    </div>
  )
}
