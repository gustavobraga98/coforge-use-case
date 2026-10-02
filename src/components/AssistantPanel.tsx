import { Badge } from './ui'

type AssistantPanelProps = {
  travelerName: string
}

export function AssistantPanel({ travelerName }: AssistantPanelProps) {
  return (
    <section className="assistant-panel" aria-labelledby="assistant-panel-heading">
      <div className="assistant-panel__heading">
        <h2 id="assistant-panel-heading">AI Assistant</h2>
        <Badge>Ready</Badge>
      </div>
      <p className="assistant-panel__invitation">Ready to plan {travelerName}&apos;s trip</p>
      <p className="assistant-panel__description">Start with a travel request. The planning conversation will appear here alongside the trip context.</p>
    </section>
  )
}
