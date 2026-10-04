import { type FormEvent, type KeyboardEvent, useState } from 'react'
import type { TripScenario } from '../data/tripScenario'
import { Badge, Button } from './ui'

export type AssistantChatRole = 'user' | 'assistant'

type TripBudget = {
  amount: number | null
  currency: string | null
}

type TripConstraints = {
  origin: string | null
  destination: string | null
  departureDate: string | null
  returnDate: string | null
  arriveBefore: string | null
  directFlightsPreferred: boolean | null
  budget: TripBudget | null
}

type MissingField =
  | 'origin'
  | 'destination'
  | 'departureDate'
  | 'returnDate'
  | 'arrivalDeadline'
  | 'directFlightPreference'
  | 'budget'

type Interpretation = {
  constraints: TripConstraints
  status: 'complete' | 'needs_clarification'
  missingFields: MissingField[]
}

export type AssistantChatMessage = {
  id: string
  role: AssistantChatRole
  content: string
  interpretation?: Interpretation
}

type AssistantPanelProps = {
  scenario: TripScenario
  messages: readonly AssistantChatMessage[]
  onMessagesChange: (messages: AssistantChatMessage[]) => void
}

type ApiError = {
  detail?: { message?: string }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/New_York',
})

const missingFieldLabels: Record<MissingField, string> = {
  origin: 'departure city',
  destination: 'destination',
  departureDate: 'departure date',
  returnDate: 'return date',
  arrivalDeadline: 'arrival deadline',
  directFlightPreference: 'flight preference',
  budget: 'budget',
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`))
}

function formatDateRange(departureDate: string, returnDate: string) {
  const departure = new Date(`${departureDate}T00:00:00Z`)
  const returnDateValue = new Date(`${returnDate}T00:00:00Z`)

  return departure.getUTCMonth() === returnDateValue.getUTCMonth()
    && departure.getUTCFullYear() === returnDateValue.getUTCFullYear()
    ? `${formatDate(departureDate)}–${returnDateValue.getUTCDate()}, ${returnDateValue.getUTCFullYear()}`
    : `${formatDate(departureDate)}–${formatDate(returnDate)}`
}

function formatBudget(budget: TripBudget | null) {
  if (budget?.amount === null || budget?.amount === undefined || !budget.currency) {
    return null
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: budget.currency,
    maximumFractionDigits: 0,
  }).format(budget.amount)
}

function createMessageId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createAssistantReply(interpretation: Interpretation) {
  if (interpretation.status === 'complete') {
    return 'I’ve captured the trip requirements. I’m organizing the simulated plan.'
  }

  const missing = interpretation.missingFields.map((field) => missingFieldLabels[field]).join(', ')
  return `I have the initial details. Please share the ${missing}.`
}

function ConstraintSummary({ interpretation }: { interpretation: Interpretation }) {
  const { constraints } = interpretation
  const route = constraints.origin && constraints.destination
    ? `${constraints.origin} to ${constraints.destination}`
    : null
  const dates = constraints.departureDate && constraints.returnDate
    ? formatDateRange(constraints.departureDate, constraints.returnDate)
    : null
  const arrival = constraints.arriveBefore
    ? `Before ${timeFormatter.format(new Date(constraints.arriveBefore))} on ${formatDate(constraints.arriveBefore.slice(0, 10))}`
    : null
  const preference = constraints.directFlightsPreferred === null
    ? null
    : constraints.directFlightsPreferred ? 'Direct flights' : 'Connections accepted'
  const budget = formatBudget(constraints.budget)
  const fields = [
    ['Route', route],
    ['Travel period', dates],
    ['Arrival', arrival],
    ['Flight preference', preference],
    ['Budget ceiling', budget],
  ].filter((field): field is [string, string] => field[1] !== null)

  if (fields.length === 0) {
    return null
  }

  return (
    <ul className="assistant-requirements" aria-label="Recognized trip requirements">
      {fields.map(([label, value]) => <li key={label}><span>{label}</span><strong>{value}</strong></li>)}
    </ul>
  )
}

function AssistantMessage({ message }: { message: AssistantChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <article
      className={`assistant-message assistant-message--${isUser ? 'traveler' : 'assistant'}`}
      aria-label={isUser ? 'Your planning request' : 'Atlas Travel response'}
    >
      <span className="assistant-message__author">{isUser ? 'You' : 'Atlas Travel'}</span>
      {isUser ? <p>{message.content}</p> : <><h3>{message.content}</h3>{message.interpretation && <ConstraintSummary interpretation={message.interpretation} />}</>}
    </article>
  )
}

export function AssistantPanel({ scenario, messages, onMessagesChange }: AssistantPanelProps) {
  const [draft, setDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasMessages = messages.length > 0
  const latestInterpretation = [...messages].reverse().find((message) => message.interpretation)?.interpretation

  async function interpretConversation(nextMessages: AssistantChatMessage[]) {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/assistant/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({})) as ApiError
        throw new Error(error.detail?.message || 'The local assistant is unavailable. Try again once LM Studio is running.')
      }

      const interpretation = await response.json() as Interpretation
      onMessagesChange([
        ...nextMessages,
        {
          id: createMessageId(),
          role: 'assistant',
          content: createAssistantReply(interpretation),
          interpretation,
        },
      ])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The local assistant is unavailable. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function submitDraft() {
    const content = draft.trim()

    if (!content || isSubmitting) {
      return
    }

    const nextMessages = [...messages, { id: createMessageId(), role: 'user' as const, content }]
    onMessagesChange(nextMessages)
    setDraft('')
    void interpretConversation(nextMessages)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submitDraft()
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submitDraft()
    }
  }

  function useDemoSuggestion() {
    setDraft(scenario.request.naturalLanguage)
  }

  return (
    <section className="assistant-panel" aria-labelledby="assistant-panel-heading">
      <div className="assistant-panel__heading">
        <div>
          <h2 id="assistant-panel-heading">AI Assistant</h2>
          <p>Describe the fictional trip you want to plan.</p>
        </div>
        <Badge>Local chat</Badge>
      </div>

      <div className="assistant-conversation" aria-live="polite" aria-label="Assistant conversation">
        {!hasMessages && (
          <div className="assistant-empty-state">
            <p>Start with a request in your own words. Atlas Travel will organize the details before showing any simulated choices.</p>
            <button className="assistant-suggestion" type="button" onClick={useDemoSuggestion}>
              Use Gustavo&apos;s fictional demo request
            </button>
          </div>
        )}
        {messages.map((message) => <AssistantMessage key={message.id} message={message} />)}
      </div>

      {errorMessage && (
        <div className="assistant-error" role="alert">
          <p>{errorMessage}</p>
          <Button tone="quiet" type="button" onClick={() => void interpretConversation([...messages])} disabled={isSubmitting}>
            Retry
          </Button>
        </div>
      )}

      <form className="assistant-composer" onSubmit={handleSubmit}>
        <label htmlFor="assistant-request">Your message</label>
        <textarea
          id="assistant-request"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleComposerKeyDown}
          placeholder="For example: Plan a fictional trip from São Paulo to New York…"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="assistant-composer__actions">
          <span>{isSubmitting ? 'Organizing your request…' : 'Enter to send · Shift+Enter for a new line'}</span>
          <Button type="submit" disabled={!draft.trim() || isSubmitting}>{isSubmitting ? 'Organizing…' : 'Send'}</Button>
        </div>
      </form>

      {latestInterpretation?.status === 'complete' && (
        <section className="assistant-next-step" aria-labelledby="assistant-next-step-heading">
          <h3 id="assistant-next-step-heading">Next, compare the trade-offs</h3>
          <p>Atlas Travel will organize simulated choices around cost, comfort, and arrival time before asking for a decision.</p>
        </section>
      )}
    </section>
  )
}
