# Safari Alternate Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Mac Safari-only proof journey that uses native document scroll instead of the existing fixed internal scroller engine.

**Architecture:** The existing Chrome/main experience remains the default. Mac Safari gets an isolated overlay/section driven by `window.scrollY`, using existing project content and case-study URLs but not the current `introScrollJourney` / `scrollJourney` runtime as its scroll source. The proof includes one native-scroll scene, one project popover, and case-study open/close continuity.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing frame CDN, existing Vercel static deploy.

---

### Task 1: Add Safari Mode Routing Shell

**Files:**
- Modify: `/Users/divyachakravarthy/Desktop/final-contact-scene-github-upload/index.html`
- Modify: `/Users/divyachakravarthy/Desktop/final-contact-scene-github-upload/styles.css`
- Modify: `/Users/divyachakravarthy/Desktop/final-contact-scene-github-upload/script.js`

- [ ] **Step 1: Add a Safari-only root container**

Add this near the existing journey containers in `index.html`, after `#scrollJourney`:

```html
      <section class="safari-journey" id="safariJourney" aria-hidden="true">
        <canvas class="safari-journey__canvas" id="safariJourneyCanvas"></canvas>
        <div class="safari-journey__shade"></div>
        <div class="safari-journey__content">
          <p class="safari-journey__eyebrow" id="safariJourneyEyebrow">KINDLING</p>
          <h1 class="safari-journey__title" id="safariJourneyTitle">The First Chamber</h1>
          <p class="safari-journey__hint">Scroll to move through the palace.</p>
          <button class="safari-journey__project" id="safariProjectButton" type="button">View project</button>
        </div>
        <div class="safari-journey__spacer" aria-hidden="true"></div>
      </section>
```

- [ ] **Step 2: Add Safari shell CSS**

Add this near the existing scroll journey CSS in `styles.css`:

```css
.safari-journey {
  display: none;
  position: relative;
  min-height: 420vh;
  background: #090d16;
  color: var(--text);
}

body.is-mac-safari-alt .page {
  min-height: 420vh;
  overflow: visible;
}

body.is-mac-safari-alt {
  overflow-y: auto;
  perspective: none;
}

body.is-mac-safari-alt .intro-scroll-journey,
body.is-mac-safari-alt .scroll-journey,
body.is-mac-safari-alt .journey-chrome {
  display: none !important;
}

body.is-mac-safari-alt .safari-journey {
  display: block;
}

.safari-journey__canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  z-index: 1;
}

.safari-journey__shade {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(5, 7, 13, 0.05), rgba(5, 7, 13, 0.46));
}

.safari-journey__content {
  position: fixed;
  left: 50%;
  bottom: 12vh;
  z-index: 3;
  width: min(760px, calc(100vw - 48px));
  transform: translateX(-50%);
  text-align: center;
  pointer-events: auto;
}

.safari-journey__eyebrow,
.safari-journey__hint {
  margin: 0;
  font-family: "Noto Sans", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(237, 230, 214, 0.72);
}

.safari-journey__title {
  margin: 0.8rem 0 1rem;
  font-family: "EB Garamond", serif;
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 400;
  line-height: 0.94;
  color: #f0eadc;
}

.safari-journey__project {
  margin-top: 1.6rem;
  border: 1px solid rgba(240, 234, 220, 0.42);
  border-radius: 999px;
  padding: 0.78rem 1.4rem;
  background: rgba(9, 13, 22, 0.44);
  color: #f0eadc;
  font-family: "Noto Sans", sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
}

.safari-journey__spacer {
  height: 420vh;
}
```

- [ ] **Step 3: Add mode detection without changing non-Safari behavior**

Add this in `script.js`, after `isMacSafari()`:

```js
function isDesktopMacSafariAltEligible() {
  return isMacSafari() && getViewportMode() === "desktop";
}
```

Add this near startup after event listener setup:

```js
if (isDesktopMacSafariAltEligible()) {
  document.body.classList.add("is-mac-safari-alt");
}
```

- [ ] **Step 4: Verify syntax**

Run:

```bash
node --check script.js
```

Expected: no output and exit code `0`.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css script.js docs/superpowers/plans/2026-05-11-safari-alternate-journey.md
git commit -m "Add Safari alternate journey shell"
```

### Task 2: Drive One Safari Scene From Native Scroll

**Files:**
- Modify: `/Users/divyachakravarthy/Desktop/final-contact-scene-github-upload/script.js`

- [ ] **Step 1: Add Safari journey DOM references**

Add near existing DOM constants:

```js
const safariJourney = document.getElementById("safariJourney");
const safariJourneyCanvas = document.getElementById("safariJourneyCanvas");
const safariJourneyEyebrow = document.getElementById("safariJourneyEyebrow");
const safariJourneyTitle = document.getElementById("safariJourneyTitle");
const safariProjectButton = document.getElementById("safariProjectButton");
```

- [ ] **Step 2: Add Safari stream state**

Add near other journey state variables:

```js
let safariJourneyActive = false;
let safariJourneyStream = null;
let safariJourneyRaf = 0;
let safariProjectOpened = false;
```

- [ ] **Step 3: Add initialization helpers**

Add after `createSceneFrameStream()`:

```js
function ensureSafariJourneyStream() {
  if (!safariJourneyCanvas) return null;
  if (!safariJourneyStream) {
    safariJourneyStream = createSceneFrameStream({
      basePath: "./assets/scene2-frames-1600",
      totalFrames: 121,
      canvas: safariJourneyCanvas,
      sceneKey: "s2",
    });
  }
  return safariJourneyStream;
}

function resizeSafariJourneyCanvas() {
  if (!safariJourneyCanvas) return;
  safariJourneyCanvas.width = window.innerWidth;
  safariJourneyCanvas.height = window.innerHeight;
  if (safariJourneyStream) {
    safariJourneyStream.resizeToViewport();
  }
}
```

- [ ] **Step 4: Add scroll renderer**

Add after the helpers:

```js
function renderSafariJourney() {
  if (!safariJourneyActive || !safariJourney || !safariJourneyStream) return;
  const maxScroll = Math.max(1, safariJourney.offsetHeight - window.innerHeight);
  const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  const frame = Math.round(progress * 120);
  const now = performance.now();
  safariJourneyStream.setTarget(frame, now);
  safariJourneyStream.draw(frame);

  if (safariJourneyEyebrow) {
    safariJourneyEyebrow.textContent = progress > 0.52 ? "KINDLING" : "THE PASSAGE";
  }
  if (safariJourneyTitle) {
    safariJourneyTitle.textContent = progress > 0.52 ? "A brand with warmth." : "The First Chamber";
  }
  if (safariProjectButton) {
    safariProjectButton.style.opacity = progress > 0.52 ? "1" : "0.42";
  }
}

function queueSafariJourneyRender() {
  if (safariJourneyRaf) return;
  safariJourneyRaf = window.requestAnimationFrame(() => {
    safariJourneyRaf = 0;
    renderSafariJourney();
  });
}
```

- [ ] **Step 5: Activate Safari proof after entry**

Add:

```js
function startSafariAlternateJourney() {
  if (!isDesktopMacSafariAltEligible() || !safariJourney || safariJourneyActive) return false;
  safariJourneyActive = true;
  document.body.classList.add("is-mac-safari-alt-active");
  safariJourney.setAttribute("aria-hidden", "false");
  resizeSafariJourneyCanvas();
  safariJourneyStream = ensureSafariJourneyStream();
  if (safariJourneyStream) {
    safariJourneyStream.preloadRange(0, 121);
    safariJourneyStream.setTarget(0, performance.now());
    safariJourneyStream.draw(0);
  }
  window.scrollTo(0, 0);
  queueSafariJourneyRender();
  return true;
}
```

In `startExperience()`, add this at the top after the duplicate-start guard:

```js
  if (startSafariAlternateJourney()) {
    return;
  }
```

- [ ] **Step 6: Wire scroll and resize**

Near existing window listeners:

```js
window.addEventListener("scroll", queueSafariJourneyRender, { passive: true });
window.addEventListener("resize", () => {
  resizeSafariJourneyCanvas();
  queueSafariJourneyRender();
});
```

- [ ] **Step 7: Verify syntax**

Run:

```bash
node --check script.js
```

Expected: no output and exit code `0`.

- [ ] **Step 8: Commit**

```bash
git add script.js
git commit -m "Drive Safari proof journey from native scroll"
```

### Task 3: Add One Project Popover And Case Study Continuity

**Files:**
- Modify: `/Users/divyachakravarthy/Desktop/final-contact-scene-github-upload/script.js`
- Modify: `/Users/divyachakravarthy/Desktop/final-contact-scene-github-upload/styles.css`

- [ ] **Step 1: Add Safari project button handler**

Add after `startSafariAlternateJourney()`:

```js
function openSafariProofProject() {
  if (!safariJourneyActive || safariProjectOpened) return;
  safariProjectOpened = true;
  showProjectPopover("s4", () => {
    safariProjectOpened = false;
    document.body.style.overflowY = "auto";
  }, {
    scrollDismiss: false,
    holdDuration: 0,
    autoDismissAfter: 0,
    entranceDelay: 0,
    entranceDuration: 280,
    entranceOpacityDuration: 220,
  });
}
```

Near existing event listeners:

```js
if (safariProjectButton) {
  safariProjectButton.addEventListener("click", () => {
    playUiClick();
    openSafariProofProject();
  });
}
```

- [ ] **Step 2: Ensure Safari popover does not freeze native page scroll after close**

In the `showProjectPopover("s4", ...)` callback from Step 1, keep `document.body.style.overflowY = "auto";`. This explicit restore is only in the Safari proof callback and does not alter the main journey popover path.

- [ ] **Step 3: Add a Safari-specific CTA visual state**

Add to `styles.css`:

```css
body.is-mac-safari-alt-active .project-popover {
  position: fixed;
}
```

- [ ] **Step 4: Verify case-study open/close code path is reused**

No code change needed. The existing project popover CTA uses `caseStudySrcByScene.s4`, and `closeCaseStudyOverlay()` already restores scrolling immediately from the safe fix.

- [ ] **Step 5: Verify syntax**

Run:

```bash
node --check script.js
```

Expected: no output and exit code `0`.

- [ ] **Step 6: Commit**

```bash
git add script.js styles.css
git commit -m "Add Safari proof project interaction"
```

### Task 4: Deploy Proof Preview

**Files:**
- Modify: `/Users/divyachakravarthy/Desktop/final-contact-scene-github-upload/index.html`

- [ ] **Step 1: Bump cache key**

Change the CSS and JS query strings in `index.html` to:

```html
<link rel="stylesheet" href="./styles.css?v=safari-alt-proof-1" />
<script src="./script.js?v=safari-alt-proof-1"></script>
```

- [ ] **Step 2: Run final syntax check**

Run:

```bash
node --check script.js
```

Expected: no output and exit code `0`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Prepare Safari alternate proof preview"
```

- [ ] **Step 4: Push branch**

Run:

```bash
git push -u origin codex/safari-alt-journey
```

Expected: branch pushed to GitHub.

- [ ] **Step 5: Deploy preview**

Run:

```bash
npx vercel deploy --scope divvzntx-alts-projects --yes
```

Expected: Vercel returns a ready preview URL.

## Self-Review

- Spec coverage: The plan implements a Mac Safari-only branch, native document scroll proof, one project popover, and case-study continuity without changing the main internal scroll engine.
- Placeholder scan: No TBD/TODO placeholders are present.
- Scope check: This plan intentionally stops at one proof project before expanding the full Safari rebuild.
