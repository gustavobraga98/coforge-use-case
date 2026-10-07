import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { AssistantPlanningProgress } from '../src/components/AssistantPlanningProgress'
import { findTravelLocation } from '../src/data/tripScenario'
import { applyPlanAction, initialPlan, type AssistantPlanState } from '../src/plan/travelPlan'

const route = {
  origin: findTravelLocation('Chicago')!,
  destination: findTravelLocation('Miami')!,
}
const otherRoute = {
  origin: findTravelLocation('Toronto')!,
  destination: findTravelLocation('Miami')!,
}
const period = { departureDate: '2026-11-04', returnDate: '2026-11-06' }

afterEach(cleanup)

function through(stage: 'budget' | 'route' | 'dates' | 'flights' | 'stays' | 'review' | 'confirmation' | 'confirmed'): AssistantPlanState {
  let plan = initialPlan()
  if (stage === 'budget') return plan
  plan = applyPlanAction(plan, { type: 'setBudget', budgetUsd: 3000 })
  if (stage === 'route') return plan
  plan = applyPlanAction(plan, { type: 'setRoute', route })
  if (stage === 'dates') return plan
  plan = applyPlanAction(plan, { type: 'confirmDates', period })
  if (stage === 'flights') return plan
  plan = applyPlanAction(plan, { type: 'selectFlight', id: plan.scenario!.flightOptions[0].id })
  if (stage === 'stays') return plan
  plan = applyPlanAction(plan, { type: 'selectHotel', id: plan.scenario!.hotelOptions[0].id })
  if (stage === 'review') return plan
  plan = applyPlanAction(plan, { type: 'requestReview' })
  if (stage === 'confirmation') return plan
  return applyPlanAction(plan, { type: 'confirmSimulatedPlan', revision: plan.revision })
}

describe('AssistantPlanningProgress', () => {
  it.each([
    ['budget', 'Budget', 0],
    ['route', 'Route', 1],
    ['dates', 'Dates', 2],
    ['flights', 'Flight', 3],
    ['stays', 'Stay', 4],
    ['review', 'Review & confirm', 5],
    ['confirmation', 'Review & confirm', 5],
  ] as const)('shows %s as the current stage', (stage, currentLabel, completeCount) => {
    const { container } = render(<AssistantPlanningProgress plan={through(stage)} />)

    expect(screen.getByRole('navigation', { name: 'AI Assistant planning progress' })).toBeTruthy()
    expect(screen.getByText(currentLabel).closest('li')?.getAttribute('aria-current')).toBe('step')
    expect(screen.getByRole('status').textContent).toContain(`${completeCount} of 6 planning steps complete.`)
    expect(container.querySelectorAll('li[aria-current="step"]')).toHaveLength(1)
  })

  it('marks every step complete after simulated confirmation', () => {
    const { container } = render(<AssistantPlanningProgress plan={through('confirmed')} />)

    expect(container.querySelectorAll('.assistant-planning-progress__step--complete')).toHaveLength(6)
    expect(container.querySelectorAll('li[aria-current="step"]')).toHaveLength(0)
    expect(screen.getByRole('status').textContent).toContain('All six planning steps are complete.')
  })

  it('moves back when a choice, period, or route change invalidates later steps', () => {
    let plan = through('confirmed')
    plan = applyPlanAction(plan, { type: 'selectFlight', id: plan.scenario!.flightOptions[1].id })
    const { rerender } = render(<AssistantPlanningProgress plan={plan} />)

    expect(screen.getByText('Review & confirm').closest('li')?.getAttribute('aria-current')).toBe('step')

    plan = applyPlanAction(plan, { type: 'confirmDates', period: { ...period, returnDate: '2026-11-07' } })
    rerender(<AssistantPlanningProgress plan={plan} />)

    expect(screen.getByText('Flight').closest('li')?.getAttribute('aria-current')).toBe('step')
    expect(screen.getByText('Review & confirm').closest('li')?.hasAttribute('aria-current')).toBe(false)

    plan = applyPlanAction(plan, { type: 'setRoute', route: otherRoute })
    rerender(<AssistantPlanningProgress plan={plan} />)

    expect(screen.getByText('Flight').closest('li')?.getAttribute('aria-current')).toBe('step')
    expect(screen.getByText('Stay').closest('li')?.hasAttribute('aria-current')).toBe(false)
  })
})
