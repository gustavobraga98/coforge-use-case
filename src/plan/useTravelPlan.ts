import { useCallback, useRef, useState } from 'react'
import { applyPlanAction, initialPlan, type PlanAction } from './travelPlan'

export function useTravelPlan() {
  const [plan, setPlan] = useState(initialPlan)
  const current = useRef(plan)
  const dispatch = useCallback((action: PlanAction) => {
    const next = applyPlanAction(current.current, action)
    current.current = next
    setPlan(next)
    return next
  }, [])
  const getPlan = useCallback(() => current.current, [])
  return { plan, dispatch, getPlan }
}
