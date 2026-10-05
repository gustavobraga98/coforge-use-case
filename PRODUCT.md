# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are people planning corporate travel. The mock follows a traveler named Gustavo and is intended to demonstrate the experience to stakeholders evaluating how an existing enterprise platform can become easier to use.

## Product Purpose

Atlas Travel is a fictional corporate travel-planning platform. It demonstrates how a person can plan, approve, and track a work trip through either traditional controls or an AI-assisted conversation, while preserving the same information, rules, and decisions.

Success means that, within a short demonstration, viewers understand that the assistant coordinates existing platform capabilities instead of replacing them.

## Positioning

The same trip-planning capabilities are available in two modes: a conventional interface for entering constraints, filtering, comparing, and confirming; and an AI-assisted interface that turns a natural-language request into organized choices and explicit approvals.

## Operating Context

The principal scenario is a fictional trip for Gustavo from São Paulo to New York, from 12 to 16 November. The plan accounts for travel preferences, itinerary, budget, and corporate policy. The demonstration can later include a simulated return-flight cancellation that requires replanning.

## Capabilities and Constraints

- The mock will present trip context, alternatives, costs, policy alerts, approval requests, and a simulated confirmation.
- It must support traditional and AI-assisted planning without changing the underlying trip data or rules.
- The experience includes an interactive local 3D globe with real geography; trip routes and all travel information remain simulated.
- Reusable interface components are compatible with CopilotKit v2 Generative UI integration: typed, structured props are required, and the assistant must not generate arbitrary interface markup.
- The assisted implementation uses a local Python/FastAPI backend and a PydanticAI agent. CopilotKit connects that agent to registered React GenUI components while preserving the existing web interface as the planning surface.
- All names, itineraries, values, policies, reservations, suppliers, and business operations are fictional.
- It must not connect to real services, make purchases or bookings, communicate externally, retain customer data, or reproduce a client's flows, rules, or data.

## Brand Commitments

- The provisional product name is Atlas Travel.
- The experience should communicate a corporate planning platform without suggesting a real company or travel provider.

## Evidence on Hand

- Product vision: `docs/travel-planner-demo.md`.
- Delivery scope and acceptance criteria: `docs/travel-planner-delivery-plan.md`.
- Task backlog: `tasks/`.
- There are no real customer records, integrations, reservations, or external proof assets. Future work must not fabricate them.

## Product Principles

1. Let people start with a normal request or conventional controls, according to their preference.
2. Show information in the form that makes the next decision clear.
3. Ask for a decision only when it materially matters, and make its trade-offs explicit.
4. Make cost, policy, and approval implications transparent before sensitive simulated actions.
5. Keep the planning journey understandable as the trip plan evolves.

## Accessibility & Inclusion

The web interface must preserve semantic structure, keyboard operation, visible focus, and accessible labels for interactive controls.
