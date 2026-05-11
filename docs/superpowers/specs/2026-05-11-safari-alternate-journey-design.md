# Safari Alternate Journey Design

## Goal

Mac Safari should get a stable, intentional version of the portfolio instead of the Chrome-first cinematic engine that currently freezes or mis-sizes its fixed internal scrollers. The main experience remains untouched for browsers where it already works well.

## Browser Routing

Detect desktop Mac Safari only. When detected, the page enables a Safari-specific journey layer and disables the current internal-scroll cinematic journey before it becomes interactive. iPhone and iPad Safari should continue to use the existing mobile/tablet experience, because those have been testing acceptably and should not inherit the Mac workaround.

## Architecture

The Safari journey uses native document scroll as the source of truth. Visual layers can be fixed, but scroll progress comes from `window.scrollY`, not from nested fixed overflow containers. This avoids Safari's fragile behavior with fixed descendants, internal scrollers, sticky content, overlays, and custom wheel handling.

The first proof should be intentionally small:

- opening entry remains visually consistent with the current page
- after entry, Safari enters a new document-scroll journey
- one frame sequence or visual scene advances from `window.scrollY`
- one project threshold opens a project popover
- the popover can open and close one case study
- after closing the case study, native scrolling still continues

## Reuse

Reuse existing assets, typography, colors, audio assets if stable, project content, and case-study URLs. Do not reuse the current `introScrollJourney` / `scrollJourney` internal-scroller runtime as the Safari source of truth.

## Non-Goals

- Do not change the working Chrome/main experience.
- Do not reintroduce the root-scroll proxy into the main engine.
- Do not tune mobile/tablet readiness thresholds in this slice.
- Do not try to rebuild every project before the one-project proof works in Safari.

## Success Criteria

- In Mac Safari, the alternate journey scrolls using the native page scrollbar or trackpad.
- The scroll container debug issue (`client=8x0`) is irrelevant because the Safari path does not depend on that internal container.
- Opening and closing a project/case-study overlay does not block further scroll.
- Chrome and existing mobile/tablet behavior are visually unchanged when Safari mode is not active.

## Implementation Slice

Create a minimal Safari-only proof first, guarded by a Mac Safari body class. Add only the routing and the first Safari journey layer. Deploy it as a branch preview before expanding the experience to all projects.
