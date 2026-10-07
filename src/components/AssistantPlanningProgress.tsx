import { planStage, type AssistantPlanState, type PlanStage } from '../plan/travelPlan'

type ProgressState = 'pending' | 'current' | 'complete'

type ProgressStep = {
  id: 'budget' | 'route' | 'dates' | 'flights' | 'stays' | 'review'
  label: string
}

const steps: readonly ProgressStep[] = [
  { id: 'budget', label: 'Budget' },
  { id: 'route', label: 'Route' },
  { id: 'dates', label: 'Dates' },
  { id: 'flights', label: 'Flight' },
  { id: 'stays', label: 'Stay' },
  { id: 'review', label: 'Review & confirm' },
]

const stageIndex: Record<PlanStage, number> = {
  budget: 0,
  route: 1,
  dates: 2,
  flights: 3,
  stays: 4,
  review: 5,
  confirmation: 5,
  confirmed: 6,
}

function assistantProgressState(plan: AssistantPlanState, step: ProgressStep['id']): ProgressState {
  const index = steps.findIndex(({ id }) => id === step)
  const currentIndex = stageIndex[planStage(plan)]

  if (currentIndex > index) return 'complete'
  if (currentIndex === index) return 'current'
  return 'pending'
}

export function AssistantPlanningProgress({ plan }: { plan: AssistantPlanState }) {
  const stage = planStage(plan)
  const completeCount = stageIndex[stage]
  const summary = stage === 'confirmed'
    ? 'All six planning steps are complete.'
    : `${completeCount} of 6 planning steps complete. Current step: ${steps[completeCount].label}.`

  return (
    <nav className="assistant-planning-progress" aria-label="AI Assistant planning progress">
      <p className="sr-only" role="status">{summary}</p>
      <ol>
        {steps.map((step, index) => {
          const state = assistantProgressState(plan, step.id)
          return (
            <li
              key={step.id}
              className={`assistant-planning-progress__step assistant-planning-progress__step--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="assistant-planning-progress__marker" aria-hidden="true">
                {state === 'complete' ? '✓' : index + 1}
              </span>
              <strong>{step.label}</strong>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
