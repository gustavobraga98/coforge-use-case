# Agent Guidelines

## Source of truth

- Read the relevant documentation in `docs/` before planning, implementing, reviewing, or changing work.
- Treat `docs/travel-planner-demo.md` as the product-vision source of truth.
- Treat `docs/travel-planner-delivery-plan.md` as the delivery scope and acceptance-criteria source of truth.
- Read the relevant file in `tasks/` before starting a task. Its objective, scope, dependencies, acceptance criteria, and out-of-scope items define the intended PR boundary.
- If the implementation request conflicts with existing documentation, call out the conflict and request clarification before changing the documented direction.
- Update the relevant documentation when a change intentionally alters scope, behavior, decisions, or acceptance criteria.

## Implementation principles

- Keep each change focused on a single task and within its documented scope.
- Prefer small, reviewable pull requests with a clear purpose and independently verifiable acceptance criteria.
- Preserve the mock's boundaries: use only fictional data and do not add real integrations, purchases, bookings, external communication, customer data, or client-specific flows.
- Reuse shared components and canonical mock data instead of duplicating content or state.
- Do not introduce dependencies, infrastructure, or persistence unless they are necessary for the active task and documented scope.

## Language

- All source code must be written in English, including identifiers, user-facing strings, type names, test names, and configuration where applicable.
- All comments in code must be written in English.
- Documentation may remain in Portuguese when it serves the Portuguese product brief or task backlog; new technical documentation should follow the language of the surrounding document.

## Quality checks

- Run the relevant formatting, linting, type-checking, tests, and build commands available in the project before considering work complete.
- Verify the task's acceptance criteria explicitly.
- Preserve accessibility fundamentals: semantic elements, keyboard operation, visible focus, and accessible labels for interactive controls.
- Do not leave known errors, broken states, or unrelated refactors in a task PR.
