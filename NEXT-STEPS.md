# Next Steps

## First thing to test next session

Test threshold behavior on:
- `http://127.0.0.1:4176`

What to verify:
- first pass through each location seam is ceremonial
- reverse pass through the same seam is minimal
- forward again after reverse is also minimal
- all three trigger at the exact same seam point
- the slight ceremonial hitch is still acceptable or needs tuning

Key seams to test:
- Scene 2
- Scene 6
- Scene 8
- Scene 10
- Scene 13
- Scene 15
- Scene 16

## If threshold timing or reverse behavior regresses

Debug in this order:

1. Confirm seam-based threshold logic is still present
- inspect the seam helper and threshold helpers in:
  - `/Users/divyachakravarthy/Documents/Playground/new-styles copy/script.js`

2. Confirm first-pass vs revisit logic
- ceremonial first pass should use the full title sequence
- revisit should use the minimal title sequence
- project titles should never appear in location thresholds

3. If there is still slight choppiness
- inspect ceremonial threshold pacing in:
  - `/Users/divyachakravarthy/Documents/Playground/new-styles copy/script.js`
- if tuning is needed later, adjust the ceremonial threshold pacing behavior before redesigning visuals

4. Check removed-scene rewiring
- verify Scene 4 primes Scene 6
- verify Scene 11 primes Scene 13
- do not let removed scenes stay in the next-scene prime path

5. After location thresholds are fully settled
- revisit project-scene reverse behavior
- likely direction:
  - first pass stays gated with the full popover
  - reverse/revisit popover should appear but dismiss on scroll

## Constraints to preserve

- Keep the seam-masking principle:
  - the user should not see a raw cut
  - the threshold should already be active at the seam
- Location thresholds:
  - first pass ceremonial
  - reverse and repeat-forward minimal
- Project scenes:
  - keep the side popovers and current layout/content style
  - do not mix project titles into location threshold overlays
- Keep page-level veil/background separate from the popover itself

## Notes for future changes

- Take a backup before risky transition work
- if disk space blocks a full backup, create a code-state backup of:
  - `index.html`
  - `styles.css`
  - `script.js`
  - `CURRENT-STATE.md`
  - `NEXT-STEPS.md`
- Validate after each non-trivial patch:
  - `node --check "/Users/divyachakravarthy/Documents/Playground/new-styles copy/script.js"`
  - `curl -I http://127.0.0.1:4176`
- If the conversation context is lost:
  - open and read:
    - `/Users/divyachakravarthy/Documents/Playground/new-styles copy/CURRENT-STATE.md`
    - `/Users/divyachakravarthy/Documents/Playground/new-styles copy/NEXT-STEPS.md`
