# Current State

Updated: 2026-03-24

Project:
- Working folder: `/Users/divyachakravarthy/Documents/Playground/new-styles copy`
- Preview: `http://127.0.0.1:4176`
- Latest full backup: `/Users/divyachakravarthy/Documents/Playground/new-styles copy-backup-20260323-152614`
- Latest code-state backup: `/Users/divyachakravarthy/Documents/Playground/new-styles copy-backup-code-20260324-145317`

## What is working

- Scene 1 to Scene 2 transition uses the validated threshold mist/veil system instead of the old water-transition handoff.
- Scene 2 is already veiled when it appears, so the user does not see a raw clean cut.
- Scene 2 to Scene 3 uses the same continuity idea:
  - same mist + dark veil treatment
  - no `Hall of Clarity` text sequence
  - Scene 3 popup belongs to Scene 3, not late Scene 2
- Performance is noticeably better after:
  - lazy scene stream creation
  - stopping unused loops
  - reducing water trail shader cost
  - sleeping inactive effects

## Threshold system now working

- Location thresholds use seam-based triggering, not scene-entry timing.
- First pass through each location threshold is ceremonial:
  - motif
  - `Entering`
  - Brahmi
  - English
  - mist + dark veil
- Reverse and repeat-forward passes use the minimal version:
  - English only
  - mist + dark veil
  - no Brahmi
  - no motif
  - no `Entering`
- This is now wired for location thresholds:
  - `s2`
  - `s6`
  - `s8`
  - `s10`
  - `s13`
  - `s15`
  - `s16`
- Project scenes still use side popovers and are not part of the location-title threshold system.

## Current pacing behavior

- Ceremonial thresholds now briefly hold scroll so the Brahmi and English can land before the overlay clears.
- The mist also stays fuller slightly longer during ceremonial thresholds before settling down.
- Scroll holding for ceremonial thresholds has been converted into a dedicated threshold pacing behavior rather than a redesign of the visuals.

## Current visual values worth remembering

- In `/Users/divyachakravarthy/Documents/Playground/new-styles copy/styles.css`
  - `.night-world` opacity: `1`
  - `.screen-script-layer__surface` opacity: `0.08`
  - `.fluid-bg-canvas` opacity: `0.5`
  - `body.is-sequence-started .fluid-bg-canvas` opacity: `0.18`
- In `/Users/divyachakravarthy/Documents/Playground/new-styles copy/script.js`
  - `idleCoolAmount = 1.0`

## Scene 4 / Scene 11 replacement and scene removal work

Recent asset changes:
- `scene4.mp4` replaced and re-split to `241` frames
- `scene11.mp4` replaced and re-split to `241` frames
- Scene 5 removed from the active journey
- Scene 12 removed from the active journey

Important rewiring fix that worked:
- after removing Scene 5 and Scene 12, the handoff logic was still priming the removed next scenes
- this was corrected so:
  - Scene 4 now primes Scene 6, not Scene 5
  - Scene 11 now primes Scene 13, not Scene 12

User feedback after this fix:
- “OK that was cooooooolll.”
- so the Scene 4 to next-scene handoff is currently in a good state

## Scene 4 popover work

We added a new Scene 4 popover based on the motion/style direction from the external popover prototype, but:
- the page-level veil/background should remain the same as the existing continuity system
- only the popover motion/panel style is borrowed
- glyphs inside the popover should stay faint, using the earlier popup treatment rather than the prototype’s glyph arrangement

Files already changed for this:
- `/Users/divyachakravarthy/Documents/Playground/new-styles copy/index.html`
- `/Users/divyachakravarthy/Documents/Playground/new-styles copy/styles.css`
- `/Users/divyachakravarthy/Documents/Playground/new-styles copy/script.js`

The Scene 4 popover now exists in the DOM as:
- `#projectPopover`
- `#projectPopoverGlyphField`
- `#projectPopoverDismiss`
- `#projectPopoverCta`

## Latest Scene 4 trigger adjustment

The popover trigger was moved so it fires when Scene 4 becomes active, not later during the Scene 4 range.

Current logic:
- in the Scene 4 branch of `beginScrollJourney()`
- inside `if (activeScene !== "s4")`
- it now:
  - ensures `s4Stream` exists and primes frame 0
  - shows the veil
  - locks scroll
  - calls `showProjectPopover(...)`

This was done because triggering it later in the Scene 4 range felt too fragile.

## Backup note

A new full asset backup was attempted after the successful rewiring milestone, but disk space ran out.

Because of that:
- the full asset backup did not complete
- a lightweight code-state backup was created instead
- if we want more full backups, storage cleanup will be needed first
