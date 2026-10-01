---
name: Atlas Travel
description: A dark orbital workspace for fictional corporate travel planning.
colors:
  night: "#050b14"
  header: "#060e19"
  surface: "#071522"
  card: "#091a29"
  border: "#1b3447"
  cyan: "#47dbe9"
  cyan-soft: "#61dce9"
  amber: "#f4c66d"
  text: "#e8f2f5"
  text-muted: "#9fb6c2"
typography:
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.09em"
rounded:
  card: "9px"
  panel: "12px"
  pill: "999px"
spacing:
  compact: "8px"
  standard: "12px"
  comfortable: "18px"
  shell: "36px"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "#03121a"
    rounded: "{rounded.card}"
    padding: "10px 14px"
  button-quiet:
    backgroundColor: "#0b1a29"
    textColor: "#dfebef"
    rounded: "{rounded.card}"
    padding: "10px 14px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
---

# Design System: Atlas Travel

## Overview

**Creative North Star: "The Orbital Operations Deck"**

Atlas Travel frames travel planning as a calm, high-confidence operations surface. Near-black space, local satellite geography, and restrained cyan trajectory lines make the physical route tangible without presenting a real booking system.

The visual drama belongs to the interactive Earth. Surrounding information remains compact, factual, and visibly provisional so later traditional and AI-assisted flows can occupy the same shell.

**Key Characteristics:**

- A real-geography 3D globe is the primary workspace object.
- Cyan signals active spatial context; amber marks route endpoints.
- Dense but quiet panels support, rather than compete with, the globe.

## Colors

The palette uses deep blue-black surfaces, technical cyan, and a sparing warm waypoint accent.

### Primary

- **Route Cyan:** Active route, primary action, and key status emphasis.

### Secondary

- **Waypoint Amber:** Limited to origin and destination points, preserving their scan value.

### Neutral

- **Orbital Night:** Application background and unoccupied space.
- **Deck Surface:** Panels and cards use closely stepped navy values to create hierarchy without soft shadows.
- **Cool Text:** High-contrast light text and quieter blue-gray supporting copy.

**The Sparse Signal Rule.** Cyan is an operational signal, not a decorative fill; reserve it for the route, interactive controls, and essential status.

## Typography

**Display Font:** Space Grotesk (with UI sans-serif fallback)

**Body Font:** Space Grotesk (with UI sans-serif fallback)

**Character:** A compact geometric sans keeps technical labels legible while retaining a contemporary product character.

### Hierarchy

- **Title:** Used for the brand and panel headings.
- **Body:** Used for controls, place names, and explanatory copy.
- **Label:** Uppercase, tightly controlled metadata and status labels.

## Layout

The desktop workspace uses a three-column field: route context on the left, the globe in the visual center, and planning space on the right. The rails are sized with `clamp()` so the globe remains the anchor on presentation widths. At 850px the right rail moves beneath the left rail; at 650px both rails stack below a 400px-tall globe.

**The Globe-First Rule.** Never place a dense data view where it obscures the globe’s route or its direct manipulation controls.

## Elevation & Depth

Depth comes from tonal layers, 1px cool borders, satellite imagery, and the WebGL atmosphere rather than card shadows. The globe can carry the only broad atmospheric glow because it represents the spatial workspace, not a generic container.

## Shapes

Panels use gentle rounded rectangles; cards use a slightly tighter corner. The assistant state remains the only pill-shaped control. Borders are fine and cool-toned to preserve separation against the night background.

## Components

### Buttons

- **Shape:** Compact rounded controls.
- **Primary:** Cyan fill for an affirmative action.
- **Quiet:** Dark navy fill with a cool border for supporting actions and globe controls.
- **Focus:** A visible blue focus outline is shared by all keyboard-operable controls.

### Chips

- **Style:** Text-only metadata badges with cyan or muted blue-gray color; no container fill.

### Cards / Containers

- **Corner Style:** Tight rounded corners for cards; broader rounded corners for rails.
- **Background:** Cards sit one tonal step above their containing rail.
- **Border:** One fine cool-blue border defines each surface.

### Navigation

- **Style:** A restrained header with the Atlas Travel mark at left and the disabled assistant affordance at right during T2.

### Interactive Globe

The globe uses local real-world geography, a simulated São Paulo–New York trajectory, drag rotation, scroll zoom, and explicit accessible controls. It is the signature component and must remain local-only: it neither queries nor implies a live map service.

## Do's and Don'ts

### Do:

- **Do** keep geographic rendering real while explicitly labeling routes and planning content as illustrative.
- **Do** reserve the right rail for evolving planning or assistant content without displacing the globe.
- **Do** use cyan and amber with intention, preserving contrast on dark surfaces.

### Don't:

- **Don't** imply bookings, suppliers, map traffic, or travel data are real.
- **Don't** turn supporting panels into bright competing focal points.
- **Don't** make the assistant state appear active before T5 implements its behavior.
