const brahmiDigits = ["𑁦", "𑁧", "𑁨", "𑁩", "𑁪", "𑁫", "𑁬", "𑁭", "𑁮", "𑁯"];
const brahmiGlyphs = [
  "𑀅",
  "𑀆",
  "𑀓",
  "𑀢",
  "𑀭",
  "𑀫",
  "𑀯",
  "𑀲",
  "𑀧",
  "𑀤",
  "𑁆",
  "𑀁",
];

const loadingScreen = document.getElementById("loadingScreen");
const brahmiCount = document.getElementById("brahmiCount");
const englishCount = document.getElementById("englishCount");
const walkButton = document.getElementById("walkButton");
const enterSilentButton = document.getElementById("enterSilentButton");
const fluidBgCanvas = document.getElementById("fluidBgCanvas");
const scriptField = document.getElementById("scriptField");
const screenScriptLayer = document.querySelector(".screen-script-layer");
const introOverlay = document.getElementById("introOverlay");
const introText = document.querySelector(".intro-overlay__text");
const introLines = [
  document.getElementById("introLine1"),
  document.getElementById("introLine2"),
  document.getElementById("introLine3"),
];
const introSceneCanvas = document.getElementById("introSceneCanvas");
const scrollPrompt = document.getElementById("scrollPrompt");
const touchCopyNodes = document.querySelectorAll("[data-touch-copy]");
const introScrollJourney = document.getElementById("introScrollJourney");
const scrollJourney = document.getElementById("scrollJourney");
const thresholdTransition = document.getElementById("thresholdTransition");
const mistCanvas = document.getElementById("mistCanvas");
const darkOverlay = document.getElementById("darkOverlay");
const thresholdMotif = document.getElementById("thresholdMotif");
const thresholdEntering = document.getElementById("thresholdEntering");
const thresholdBrahmi = document.getElementById("thresholdBrahmi");
const thresholdEnglish = document.getElementById("thresholdEnglish");
const journeyChrome = document.getElementById("journeyChrome");
const journeyChromeScrambles = Array.from(document.querySelectorAll(".journey-chrome__scramble"));
const journeyChromeGlyphs = Array.from(document.querySelectorAll(".journey-chrome__glyph"));
const aboutOverlayTrigger = document.getElementById("aboutOverlayTrigger");
const journeyMenuToggle = document.getElementById("journeyMenuToggle");
const journeyMobileMenu = document.getElementById("journeyMobileMenu");
const journeyMenuAbout = document.getElementById("journeyMenuAbout");
const journeyMenuSound = document.getElementById("journeyMenuSound");
const journeyMenuMotion = document.getElementById("journeyMenuMotion");
const journeySoundToggle = document.getElementById("journeySoundToggle");
const siteMusic = document.getElementById("siteMusic");
const uiClickSound = document.getElementById("uiClickSound");
const projectPopover = document.getElementById("projectPopover");
const projectPopoverGlyphField = document.getElementById("projectPopoverGlyphField");
const projectPopoverDismiss = document.getElementById("projectPopoverDismiss");
const projectPopoverCta = document.getElementById("projectPopoverCta");
const projectPopoverEyebrow = document.querySelector(".project-popover__eyebrow");
const projectPopoverTitle = document.querySelector(".project-popover__title");
const projectPopoverDesc = document.querySelector(".project-popover__desc");
const projectPopoverMeta = document.querySelector(".project-popover__meta");
const projectPopoverCtaLabel = document.querySelector(".project-popover__cta-label");
const projectPopoverBody = document.getElementById("projectPopoverBody");
const projectPopoverMobileToggle = document.getElementById("projectPopoverMobileToggle");
const projectPopoverMobileEyebrow = document.getElementById("projectPopoverMobileEyebrow");
const projectPopoverMobileTitle = document.getElementById("projectPopoverMobileTitle");
const projectPopoverMobileToggleSymbol = document.getElementById("projectPopoverMobileToggleSymbol");
const caseStudyOverlay = document.getElementById("caseStudyOverlay");
const caseStudyOverlayBackdrop = document.getElementById("caseStudyOverlayBackdrop");
const caseStudyOverlayClose = document.getElementById("caseStudyOverlayClose");
const caseStudyOverlayFrame = document.getElementById("caseStudyOverlayFrame");
const aboutOverlay = document.getElementById("aboutOverlay");
const aboutOverlayBackdrop = document.getElementById("aboutOverlayBackdrop");
const aboutOverlayClose = document.getElementById("aboutOverlayClose");
const aboutOverlayGlyphField = document.getElementById("aboutOverlayGlyphField");

const soundControls = [journeySoundToggle, journeyMenuSound].filter(Boolean);
const motionControls = [journeyMenuMotion].filter(Boolean);
let soundEnabled = true;
let soundUnlocked = false;
let motionEnabled = true;
let motionAvailable = false;
let motionPermissionState = "prompt";
let motionListening = false;
let motionRaf = null;
let motionFrameRedrawRaf = null;
let motionOffset = { x: 0, y: 0 };
let motionTargetOffset = { x: 0, y: 0 };
let musicFadeFrame = null;
let audioContext = null;
let clickSoundBuffer = null;
let clickSoundLoading = null;
let soundWaveFrames = [];
let soundWaveLoading = null;
let soundWaveRaf = null;
let soundWaveStart = 0;
let soundStartRetryTimers = [];
const soundWavePaths = Array.from(document.querySelectorAll(".sound-wave__motion"));
const sceneFrameStreams = [];
const FRAME_BASE_URL = typeof window.FRAME_BASE_URL === "string" ? window.FRAME_BASE_URL.trim() : "";
const DEBUG_SCROLL_DIAGNOSTICS = new URLSearchParams(window.location.search).has("debugScroll");
const DEBUG_SCROLL_HOLDS = DEBUG_SCROLL_DIAGNOSTICS;
const DEBUG_INTRO_SCROLL = DEBUG_SCROLL_DIAGNOSTICS;
let scrollDebugOverlay = null;
let lastScrollDebugUpdate = -Infinity;
let lastScrollDebugHold = "none";
let lastIntroDebugLog = 0;
let touchScrollHoldDepth = 0;

function pushTouchScrollHold() {
  let released = false;
  touchScrollHoldDepth += 1;
  return () => {
    if (released) return;
    released = true;
    touchScrollHoldDepth = Math.max(0, touchScrollHoldDepth - 1);
  };
}

function debugScrollHold(source, event) {
  if (!DEBUG_SCROLL_HOLDS) return;
  lastScrollDebugHold = `${source} ${event?.type || ""}`.trim();
  console.info("[scroll-hold]", source, event?.type || "unknown", {
    scrollY: window.scrollY,
    target: event?.target?.id || event?.target?.className || event?.target?.tagName || "",
  });
}

function debugIntroScroll(source, data = {}, throttleMs = 0) {
  if (!DEBUG_INTRO_SCROLL) return;
  const now = performance.now();
  if (throttleMs > 0 && now - lastIntroDebugLog < throttleMs) return;
  lastIntroDebugLog = now;
  console.info("[intro-scroll]", source, data);
}

function updateScrollDebugOverlay(data = {}) {
  if (!DEBUG_SCROLL_DIAGNOSTICS) return;
  const now = performance.now();
  if (now - lastScrollDebugUpdate < 180) return;
  lastScrollDebugUpdate = now;
  if (!scrollDebugOverlay) {
    scrollDebugOverlay = document.createElement("div");
    scrollDebugOverlay.style.cssText = [
      "position:fixed",
      "left:12px",
      "bottom:12px",
      "z-index:2147483647",
      "max-width:min(420px, calc(100vw - 24px))",
      "padding:10px 12px",
      "background:rgba(3, 8, 14, 0.84)",
      "color:#dff4ff",
      "font:11px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      "border:1px solid rgba(176, 225, 255, 0.35)",
      "border-radius:6px",
      "pointer-events:none",
      "white-space:pre-wrap",
    ].join(";");
    document.body.appendChild(scrollDebugOverlay);
  }
  const frameState = data.stream && typeof data.stream.getDebugState === "function"
    ? data.stream.getDebugState(data.frame)
    : null;
  const hasScrollHold = lastScrollDebugHold !== "none";
  const status = hasScrollHold
    ? "SCROLL HELD"
    : frameState && !frameState.hasTarget
      ? "FRAME MISSING"
      : "OK";
  scrollDebugOverlay.textContent = [
    `status: ${status}`,
    `scene: ${data.scene || "n/a"} frame: ${Math.round(data.frame ?? 0)}`,
    `target loaded: ${frameState ? frameState.hasTarget : "n/a"} loading: ${frameState ? frameState.isTargetLoading : "n/a"}`,
    `cache/loading: ${frameState ? `${frameState.cacheSize}/${frameState.loadingSize}` : "n/a"}`,
    `threshold active: ${thresholdTransition?.classList.contains("is-active") ? "yes" : "no"}`,
    `popover: ${projectPopover?.getAttribute("aria-hidden") === "false" ? "open" : "closed"}`,
    `last hold: ${lastScrollDebugHold}`,
    `scrollTop: ${Math.round(data.scrollTop ?? 0)}`,
  ].join("\n");
}

if (DEBUG_SCROLL_DIAGNOSTICS) {
  window.requestAnimationFrame(() => {
    updateScrollDebugOverlay({
      scene: "debug-ready",
      scrollTop: scrollJourney?.scrollTop || 0,
    });
  });
}

function normalizeFrameBaseUrl(url) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

function resolveFrameBasePath(localBasePath) {
  const remoteBaseUrl = normalizeFrameBaseUrl(FRAME_BASE_URL);
  if (!remoteBaseUrl) return localBasePath;
  const frameFolder = localBasePath.replace(/^\.?\/?assets\//, "");
  return `${remoteBaseUrl}${frameFolder}`;
}

if (siteMusic) {
  siteMusic.volume = 0;
}

if (uiClickSound) {
  uiClickSound.volume = 0;
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function loadClickSoundBuffer() {
  if (clickSoundBuffer || clickSoundLoading) return clickSoundLoading;
  const context = getAudioContext();
  if (!context) return null;

  clickSoundLoading = fetch("assets/audio/ui-click.wav?v=sound-consent-pass-3")
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
    .then((buffer) => {
      clickSoundBuffer = buffer;
      return buffer;
    })
    .catch(() => {
      clickSoundLoading = null;
      return null;
    });

  return clickSoundLoading;
}

function findLottieShapeKeyframes(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findLottieShapeKeyframes(item);
      if (found) return found;
    }
    return null;
  }

  if (Array.isArray(node.k) && node.k[0]?.s?.[0]?.v) {
    return node.k;
  }

  for (const value of Object.values(node)) {
    const found = findLottieShapeKeyframes(value);
    if (found) return found;
  }

  return null;
}

function lerpPoint(a, b, progress) {
  return [
    a[0] + (b[0] - a[0]) * progress,
    a[1] + (b[1] - a[1]) * progress,
  ];
}

function interpolateLottieShape(a, b, progress) {
  if (!a || !b || a.v.length !== b.v.length) return a || b;
  return {
    c: a.c,
    v: a.v.map((point, index) => lerpPoint(point, b.v[index], progress)),
    i: a.i.map((point, index) => lerpPoint(point, b.i[index], progress)),
    o: a.o.map((point, index) => lerpPoint(point, b.o[index], progress)),
  };
}

function lottieShapeToPath(shape) {
  if (!shape?.v?.length) return "M-120 0 H120";
  const path = [`M${shape.v[0][0]} ${shape.v[0][1]}`];

  for (let index = 1; index < shape.v.length; index += 1) {
    const previous = shape.v[index - 1];
    const current = shape.v[index];
    const outgoing = shape.o[index - 1] || [0, 0];
    const incoming = shape.i[index] || [0, 0];
    path.push(
      `C${previous[0] + outgoing[0]} ${previous[1] + outgoing[1]} ` +
      `${current[0] + incoming[0]} ${current[1] + incoming[1]} ` +
      `${current[0]} ${current[1]}`
    );
  }

  return path.join(" ");
}

function getSoundWaveShapeAt(frame) {
  if (!soundWaveFrames.length) return null;
  let current = soundWaveFrames[0];
  let next = soundWaveFrames[0];

  for (let index = 0; index < soundWaveFrames.length; index += 1) {
    if (soundWaveFrames[index].t <= frame) {
      current = soundWaveFrames[index];
      next = soundWaveFrames[index + 1] || soundWaveFrames[0];
    } else {
      break;
    }
  }

  const span = next.t > current.t ? next.t - current.t : 1;
  const progress = next.t > current.t ? (frame - current.t) / span : 0;
  return interpolateLottieShape(current.shape, next.shape, Math.max(0, Math.min(1, progress)));
}

function loadSoundWaveAnimation() {
  if (soundWaveFrames.length || soundWaveLoading) return soundWaveLoading;

  soundWaveLoading = fetch("assets/audio/sound-wave.json?v=sound-consent-pass-3")
    .then((response) => response.json())
    .then((data) => {
      const keyframes = findLottieShapeKeyframes(data) || [];
      soundWaveFrames = keyframes
        .filter((keyframe) => keyframe.s?.[0]?.v)
        .map((keyframe) => ({ t: keyframe.t || 0, shape: keyframe.s[0] }))
        .sort((a, b) => a.t - b.t);
      return soundWaveFrames;
    })
    .catch(() => {
      soundWaveLoading = null;
      return [];
    });

  return soundWaveLoading;
}

function stopSoundWaveAnimation() {
  if (soundWaveRaf) {
    window.cancelAnimationFrame(soundWaveRaf);
    soundWaveRaf = null;
  }
}

function animateSoundWave(now) {
  if (!soundEnabled || !soundWaveFrames.length) {
    stopSoundWaveAnimation();
    return;
  }

  if (!soundWaveStart) soundWaveStart = now;
  const firstFrame = soundWaveFrames[0].t;
  const lastFrame = soundWaveFrames[soundWaveFrames.length - 1].t;
  const durationFrames = Math.max(1, lastFrame - firstFrame);
  const frame = firstFrame + (((now - soundWaveStart) / 1000) * 30) % durationFrames;
  const path = lottieShapeToPath(getSoundWaveShapeAt(frame));

  soundWavePaths.forEach((pathNode) => {
    pathNode.setAttribute("d", path);
  });

  soundWaveRaf = window.requestAnimationFrame(animateSoundWave);
}

function startSoundWaveAnimation() {
  if (!soundWavePaths.length || soundWaveRaf) return;
  if (soundWaveFrames.length) {
    soundWaveStart = 0;
    soundWaveRaf = window.requestAnimationFrame(animateSoundWave);
    return;
  }
  loadSoundWaveAnimation()?.then(() => {
    if (!soundEnabled || soundWaveRaf) return;
    soundWaveStart = 0;
    soundWaveRaf = window.requestAnimationFrame(animateSoundWave);
  });
}

function setSoundControlCopy() {
  const stateCopy = soundEnabled ? "On" : "Off";
  const ariaCopy = soundEnabled ? "Turn sound off" : "Turn sound on";

  soundControls.forEach((control) => {
    control.setAttribute("aria-pressed", String(soundEnabled));
    control.setAttribute("aria-label", ariaCopy);
    const stateLabel = control.querySelector(".journey-chrome__sound-state, .journey-mobile-menu__sound-state");
    if (stateLabel) {
      stateLabel.textContent = stateCopy;
      stateLabel.dataset.text = stateCopy;
    }
  });

  document.body.classList.toggle("is-sound-on", soundEnabled);
  if (soundEnabled) {
    startSoundWaveAnimation();
  } else {
    stopSoundWaveAnimation();
  }
}

function setMotionControlCopy() {
  const stateCopy = motionEnabled && motionPermissionState !== "blocked" ? "On" : "Off";
  const ariaCopy = stateCopy === "On" ? "Turn motion off" : "Turn motion on";

  motionControls.forEach((control) => {
    control.setAttribute("aria-pressed", String(stateCopy === "On"));
    control.setAttribute("aria-label", ariaCopy);
    const stateLabel = control.querySelector(".journey-mobile-menu__motion-state");
    if (stateLabel) {
      stateLabel.textContent = stateCopy;
    }
  });

  document.body.classList.toggle("is-motion-on", stateCopy === "On");
}

function isMotionViewport() {
  return viewportMode === "mobile" || viewportMode === "tablet";
}

function clampMotion(value, maxAbs = 1) {
  return Math.min(maxAbs, Math.max(-maxAbs, value));
}

function getMotionFrameOffset() {
  if (!motionEnabled || !motionAvailable || !isMotionViewport()) {
    return { x: 0, y: 0 };
  }
  return motionOffset;
}

function queueMotionFrameRedraw() {
  if (motionFrameRedrawRaf) return;
  motionFrameRedrawRaf = window.requestAnimationFrame(() => {
    motionFrameRedrawRaf = null;
    sceneFrameStreams.forEach((stream) => {
      if (stream && typeof stream.redraw === "function" && typeof stream.isVisible === "function" && stream.isVisible()) {
        stream.redraw();
      }
    });
  });
}

function animateMotionOffset() {
  motionOffset.x += (motionTargetOffset.x - motionOffset.x) * 0.16;
  motionOffset.y += (motionTargetOffset.y - motionOffset.y) * 0.16;

  if (Math.abs(motionTargetOffset.x - motionOffset.x) > 0.002 || Math.abs(motionTargetOffset.y - motionOffset.y) > 0.002) {
    queueMotionFrameRedraw();
    motionRaf = window.requestAnimationFrame(animateMotionOffset);
    return;
  }

  motionOffset.x = motionTargetOffset.x;
  motionOffset.y = motionTargetOffset.y;
  queueMotionFrameRedraw();
  motionRaf = null;
}

function setMotionTargetOffset(x, y) {
  motionTargetOffset.x = clampMotion(x, 0.26);
  motionTargetOffset.y = clampMotion(y, 0.18);
  if (!motionRaf) {
    motionRaf = window.requestAnimationFrame(animateMotionOffset);
  }
}

function handleDeviceOrientation(event) {
  if (!motionEnabled || !isMotionViewport()) return;
  const gamma = typeof event.gamma === "number" ? event.gamma : 0;
  const beta = typeof event.beta === "number" ? event.beta : 0;
  const x = clampMotion(gamma / 36, 1) * 0.26;
  const y = clampMotion((beta - 45) / 42, 1) * 0.18;
  setMotionTargetOffset(x, y);
}

function startMotionListening() {
  if (motionListening || !window.DeviceOrientationEvent) return;
  window.addEventListener("deviceorientation", handleDeviceOrientation);
  motionListening = true;
  motionAvailable = true;
  setMotionControlCopy();
}

function stopMotionListening(resetOffset = true) {
  if (motionListening) {
    window.removeEventListener("deviceorientation", handleDeviceOrientation);
    motionListening = false;
  }
  motionAvailable = false;
  if (resetOffset) {
    setMotionTargetOffset(0, 0);
  }
  setMotionControlCopy();
}

function requestMotionFromGesture() {
  if (!motionEnabled || !isMotionViewport()) {
    setMotionControlCopy();
    return Promise.resolve(false);
  }

  if (!window.DeviceOrientationEvent) {
    motionPermissionState = "blocked";
    motionEnabled = false;
    stopMotionListening();
    return Promise.resolve(false);
  }

  const permissionRequest = window.DeviceOrientationEvent.requestPermission;
  if (typeof permissionRequest === "function") {
    return permissionRequest.call(window.DeviceOrientationEvent)
      .then((state) => {
        motionPermissionState = state === "granted" ? "granted" : "blocked";
        if (motionPermissionState === "granted") {
          startMotionListening();
          return true;
        }
        stopMotionListening();
        return false;
      })
      .catch(() => {
        motionPermissionState = "blocked";
        stopMotionListening();
        return false;
      });
  }

  motionPermissionState = "granted";
  startMotionListening();
  return Promise.resolve(true);
}

function setMotionEnabled(nextEnabled, fromUser = false) {
  if (fromUser) playUiClick(true);
  motionEnabled = nextEnabled;

  if (!motionEnabled) {
    stopMotionListening();
    return;
  }

  motionPermissionState = motionPermissionState === "blocked" && fromUser ? "prompt" : motionPermissionState;
  setMotionControlCopy();

  if (fromUser || motionPermissionState !== "blocked") {
    requestMotionFromGesture();
  }
}

function playUiClick(force = false) {
  if (!soundEnabled && !force) return;
  const context = getAudioContext();
  if (!context) return;

  const playBuffer = (buffer) => {
    if (!buffer) return;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = force ? 0.24 : 0.18;
    source.connect(gain).connect(context.destination);
    source.start(0);
  };

  if (clickSoundBuffer) {
    playBuffer(clickSoundBuffer);
    return;
  }

  const loading = loadClickSoundBuffer();
  if (loading) {
    loading.then(playBuffer);
  }
}

function fadeSiteMusic(targetVolume, shouldPause = false) {
  if (!siteMusic) return;
  if (musicFadeFrame) {
    window.cancelAnimationFrame(musicFadeFrame);
    musicFadeFrame = null;
  }

  const startVolume = siteMusic.volume;
  const duration = 360;
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    siteMusic.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress < 1) {
      musicFadeFrame = window.requestAnimationFrame(step);
      return;
    }

    siteMusic.volume = targetVolume;
    musicFadeFrame = null;
    if (shouldPause) {
      siteMusic.pause();
    }
  };

  musicFadeFrame = window.requestAnimationFrame(step);
}

function clearSoundStartRetries() {
  soundStartRetryTimers.forEach((timer) => window.clearTimeout(timer));
  soundStartRetryTimers = [];
}

function startSiteMusicFromGesture(useImmediateVolume = false) {
  getAudioContext();
  loadClickSoundBuffer();
  if (!siteMusic || !soundEnabled) return;

  siteMusic.muted = false;
  if (useImmediateVolume) {
    if (musicFadeFrame) {
      window.cancelAnimationFrame(musicFadeFrame);
      musicFadeFrame = null;
    }
    siteMusic.volume = 0.34;
  }
  if (siteMusic.networkState === HTMLMediaElement.NETWORK_EMPTY) {
    siteMusic.load();
  }

  siteMusic.play().then(() => {
    soundUnlocked = true;
    if (!useImmediateVolume) {
      fadeSiteMusic(0.34);
    }
  }).catch(() => {
    soundUnlocked = false;
  });
}

function startSiteMusicWithEntryRetries() {
  clearSoundStartRetries();
  startSiteMusicFromGesture(true);
  [120, 500, 1100].forEach((delay) => {
    const timer = window.setTimeout(() => {
      if (!soundEnabled || !siteMusic || !siteMusic.paused) return;
      startSiteMusicFromGesture(true);
    }, delay);
    soundStartRetryTimers.push(timer);
  });
}

function unlockSoundOnFirstGesture(event) {
  if (event.target?.closest?.("#enterSilentButton")) return;
  if (!soundEnabled || soundUnlocked) return;
  startSiteMusicFromGesture();
}

["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, unlockSoundOnFirstGesture, { capture: true, passive: true });
});

function setSoundEnabled(nextEnabled, fromUser = false, playToggleClick = true) {
  if (soundEnabled === nextEnabled) {
    if (fromUser && soundEnabled) startSiteMusicFromGesture();
    return;
  }

  if (playToggleClick) {
    playUiClick(true);
  }
  soundEnabled = nextEnabled;
  setSoundControlCopy();

  if (!siteMusic) return;
  if (soundEnabled) {
    if (soundUnlocked || fromUser) {
      startSiteMusicFromGesture();
    }
  } else {
    fadeSiteMusic(0, true);
  }
}

setSoundControlCopy();
setMotionControlCopy();

const thresholdSceneContent = {
  s2: { brahmi: "𑀫𑀦𑁆𑀤𑀧𑀫𑁆", english: "Hall of Clarity", project: "Kindling", rail: "kindling" },
  s6: { brahmi: "𑀘𑀺𑀢𑁆𑀭𑀫𑀦𑁆𑀤𑀧𑀫𑁆", english: "Hall of Stories", project: "Thinktum", rail: "thinktum" },
  s8: { brahmi: "𑀦𑀦𑁆𑀤𑀦𑀫𑁆", english: "The Garden Court", project: "LPC", rail: "lpc" },
  s10: { brahmi: "𑀧𑀼𑀱𑁆𑀓𑀭𑀺𑀡𑀺", english: "The Sacred Waters", project: "Reignite", rail: "reignite" },
  s13: { brahmi: "𑀯𑀦𑀧𑁆𑀭𑀲𑁆𑀣𑀫𑁆", english: "The Forest Terrace", project: "eCommerce Northwest", rail: "ecnw" },
  s15: { brahmi: "𑀉𑀤𑁆𑀬𑀸𑀦𑀫𑁆", english: "The Inner Garden", project: "Contact", rail: "contact" },
};

const railProjectByScene = {
  s2: "kindling",
  s3: "kindling",
  s4: "kindling",
  s5: "kindling",
  s6: "thinktum",
  s7: "thinktum",
  s8: "lpc",
  s9: "lpc",
  s10: "reignite",
  s11: "reignite",
  s12: "reignite",
  s13: "ecnw",
  s14: "ecnw",
  s15: "contact",
  s16: "contact",
};

const projectPopoverContent = {
  s4: {
    eyebrow: "Web Design",
    title: "Kindling",
    desc: "The cannabis industry defaulted to dark and clinical. Kindling needed to go the opposite direction — building trust through clarity.",
    tags: ["E-Commerce", "UX Research", "1.5 months"],
    cta: "Step inside",
  },
  s7: {
    eyebrow: "Product Design · UX Strategy",
    title: "thinktum",
    desc: "Complex AI insurance technology made navigable — built for the agents who use it, not the engineers who built it.",
    tags: ["SaaS", "Product Design", "1.5 Months"],
    cta: "Step inside",
  },
  s9: {
    eyebrow: "Web Design",
    title: "Little Potato Company",
    desc: "A consumer brand repositioned as a kitchen staple — clarity and warmth in every interaction. 865% delivery growth. 880% sales increase.",
    tags: ["Consumer Brand", "UI / UX Design", "1 Month"],
    cta: "Step inside",
  },
  s11: {
    eyebrow: "Brand Strategy · Campaign",
    title: "Reignite",
    desc: "A rebrand built to move people forward — accelerating teams toward growth through identity, story and momentum.",
    tags: ["Branding", "Campaign", "2 Months"],
    cta: "Step inside",
  },
  s14: {
    eyebrow: "Brand Initiative · Rebrand",
    title: "ecomm NW",
    desc: "Grounded sophistication for a PNW commerce community — strategic alignment as the engine of cultural momentum.",
    tags: ["Community", "Rebrand", "2 Months"],
    cta: "Step inside",
  },
};

let glyphs = [];
let autoFlashIntervalId = null;
let autoFlashClearTimer = null;
let hoveredGlyphIndex = -1;
let currentColumns = 0;
let sequenceTimers = [];
let fluidBgController = null;
let thresholdController = null;
let visualLoopRafId = null;
let journeyFrameCallback = null;
let mistFrameCallback = null;
let caseStudyOverlayUnloadTimer = 0;
let aboutOverlayVisible = false;
let pendingCaseStudyReadiness = null;
let releaseCaseStudyReadinessTouchHold = null;
let journeyChromeVisible = false;
let journeyMenuOpen = false;
let introScrollActive = false;
let introScrollComplete = false;
let introScrollProgress = 0;
let introScrollTargetProgress = 0;
let introScrollRafId = null;
let introScrollTransitioning = false;
let introTotalFrames = 241;
let introStream = null;
let introScrollUnlockAt = 0;
let introScrollSafetyWaitUntil = 0;
let introFramesReadyBeforeSequence = false;

function clearCaseStudyReadinessHold() {
  if (releaseCaseStudyReadinessTouchHold) {
    releaseCaseStudyReadinessTouchHold();
    releaseCaseStudyReadinessTouchHold = null;
  }
}
let openingPreloadS2Stream = null;
let openingPreloadS3Stream = null;
let contactPreloadS15Stream = null;
let contactPreloadS16Stream = null;
let viewportMode = "desktop";
let projectPopoverExpanded = false;

const responsiveSceneFraming = {
  intro: {
    mobile: { x: 0, y: 0 },
    tablet: { x: 0, y: 0 },
  },
  s2: {
    mobile: { x: 0, y: 0 },
    tablet: { x: 0, y: 0 },
  },
  s3: {
    mobile: { x: 0, y: 0.04 },
    tablet: { x: 0, y: 0.02 },
  },
  s4: {
    mobile: { x: 0, y: 0.08 },
    tablet: { x: 0, y: 0.03 },
  },
  s7: {
    mobile: { x: 0.04, y: 0 },
    tablet: { x: 0.02, y: 0 },
  },
  s9: {
    mobile: { x: 0, y: 0.04 },
    tablet: { x: 0, y: 0.02 },
  },
  s11: {
    mobile: { x: 0, y: 0.02 },
    tablet: { x: 0, y: 0.01 },
  },
  s14: {
    mobile: { x: -0.03, y: 0.02 },
    tablet: { x: -0.015, y: 0.01 },
  },
};

function getViewportMode() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches;
  if (width <= 768 && height >= width) {
    return "mobile";
  }
  if (width <= 1100 || (isCoarsePointer && width <= 1368)) {
    return "tablet";
  }
  return "desktop";
}

function applyViewportMode(mode = getViewportMode()) {
  viewportMode = mode;
  document.body.classList.toggle("is-mobile-portrait", mode === "mobile");
  document.body.classList.toggle("is-tablet", mode === "tablet");
  document.body.classList.toggle("is-desktop-like", mode === "desktop");
  document.documentElement.style.setProperty("--viewport-mode", mode);
  updateResponsiveCopy();
  if (!isMotionViewport()) {
    stopMotionListening();
  } else if (motionEnabled && motionPermissionState === "granted") {
    startMotionListening();
  }
  queueMotionFrameRedraw();
}

function updateResponsiveCopy() {
  const useTouchCopy = viewportMode !== "desktop";
  touchCopyNodes.forEach((node) => {
    const nextCopy = useTouchCopy ? node.dataset.touchText : node.dataset.desktopText;
    if (nextCopy && node.textContent !== nextCopy) {
      node.textContent = nextCopy;
    }
  });
}

function getSceneFrameOffset(sceneKey) {
  const framing = responsiveSceneFraming[sceneKey];
  const motion = sceneKey === "intro" ? { x: 0, y: 0 } : getMotionFrameOffset();
  const mergeMotion = (base = { x: 0, y: 0 }) => ({
    x: clampMotion((base.x || 0) + motion.x, 0.75),
    y: clampMotion((base.y || 0) + motion.y, 0.55),
  });

  if (!framing) {
    return mergeMotion();
  }
  if (viewportMode === "mobile") {
    return mergeMotion(framing.mobile);
  }
  if (viewportMode === "tablet") {
    return mergeMotion(framing.tablet);
  }
  return { x: 0, y: 0 };
}

function clampIntroProgress(value) {
  return Math.min(1, Math.max(0, value));
}

function progressFromWheelDelta(currentProgress, deltaY) {
  const safeViewportHeight = Math.max(1, window.innerHeight);
  const progressStep = deltaY / (safeViewportHeight * introTravelScreens);
  return clampIntroProgress(currentProgress + progressStep);
}

function progressToFrameIndex(progress) {
  return Math.min(
    introTotalFrames - 1,
    Math.max(0, Math.round(clampIntroProgress(progress) * (introTotalFrames - 1)))
  );
}

function progressFromScrollPosition(scrollTop, maxScrollTop) {
  const safeMaxScrollTop = Math.max(1, maxScrollTop);
  return clampIntroProgress(scrollTop / safeMaxScrollTop);
}

function shouldBypassTouchScroller(target) {
  return Boolean(target?.closest?.([
    "a",
    "button",
    "input",
    "textarea",
    "select",
    "[role='button']",
    ".journey-mobile-menu",
    ".project-popover",
    ".case-study-overlay",
    ".about-overlay",
    ".world-overlay",
  ].join(",")));
}

function bindTouchScroller(scroller, onManualScroll) {
  if (!scroller) return;

  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;

  const canDrag = () => touchScrollHoldDepth <= 0 && scroller.classList.contains("is-active") && isMotionViewport();

  scroller.addEventListener("touchstart", (event) => {
    if (!canDrag() || event.touches.length !== 1 || shouldBypassTouchScroller(event.target)) {
      isDragging = false;
      return;
    }
    isDragging = true;
    startY = event.touches[0].clientY;
    startScrollTop = scroller.scrollTop;
  }, { passive: true });

  scroller.addEventListener("touchmove", (event) => {
    if (!isDragging || event.touches.length !== 1) return;
    if (touchScrollHoldDepth > 0) {
      debugScrollHold("touchScroller:held", event);
      event.preventDefault();
      return;
    }
    const deltaY = startY - event.touches[0].clientY;
    if (Math.abs(deltaY) < 2) return;
    const travelMultiplier = viewportMode === "mobile" ? 1.2 : viewportMode === "tablet" ? 1.1 : 1;
    scroller.scrollTop = startScrollTop + deltaY * travelMultiplier;
    if (typeof onManualScroll === "function") {
      onManualScroll();
    }
    debugScrollHold("touchScroller", event);
    event.preventDefault();
  }, { passive: false });

  const stopDragging = () => {
    isDragging = false;
  };

  scroller.addEventListener("touchend", stopDragging, { passive: true });
  scroller.addEventListener("touchcancel", stopDragging, { passive: true });
}

function shouldCompleteIntro(progress, targetProgress) {
  return clampIntroProgress(progress) >= 0.999 && clampIntroProgress(targetProgress) >= 0.999;
}

function setProjectPopoverContent(sceneKey) {
  const content = projectPopoverContent[sceneKey];
  if (!content) return;

  if (projectPopoverEyebrow) projectPopoverEyebrow.textContent = content.eyebrow;
  if (projectPopoverTitle) projectPopoverTitle.textContent = content.title;
  if (projectPopoverDesc) projectPopoverDesc.textContent = content.desc;
  if (projectPopoverCtaLabel) projectPopoverCtaLabel.textContent = content.cta;
  if (projectPopoverMobileEyebrow) projectPopoverMobileEyebrow.textContent = content.eyebrow;
  if (projectPopoverMobileTitle) projectPopoverMobileTitle.textContent = content.title;

  if (projectPopoverMeta) {
    projectPopoverMeta.innerHTML = "";
    content.tags.forEach((tag) => {
      const span = document.createElement("span");
      span.className = "project-popover__tag";
      span.textContent = tag;
      projectPopoverMeta.appendChild(span);
    });
  }
}

function isMobileProjectPanelMode() {
  return viewportMode === "mobile";
}

function setProjectPopoverExpanded(expanded) {
  projectPopoverExpanded = expanded;
  if (!projectPopover) return;
  projectPopover.classList.toggle("is-expanded", expanded);
  if (projectPopoverMobileToggle) {
    projectPopoverMobileToggle.setAttribute("aria-expanded", String(expanded));
  }
  if (projectPopoverMobileToggleSymbol) {
    projectPopoverMobileToggleSymbol.textContent = expanded ? "−" : "+";
  }
}

function getSceneThresholdContent(sceneKey) {
  return thresholdSceneContent[sceneKey] || null;
}

function setJourneyChromeActive(projectKey) {
  if (!journeyChromeGlyphs.length) return;
  journeyChromeGlyphs.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.project === projectKey);
  });
}

function showJourneyChrome(projectKey, scramble = false) {
  if (!journeyChrome) return;
  if (projectKey) {
    setJourneyChromeActive(projectKey);
  }

  if (scramble && !journeyChromeVisible) {
    journeyChromeScrambles.forEach((el) => {
      const finalText = el.dataset.text || el.textContent || "";
      primeScrambleText(el, finalText);
    });
  }

  journeyChrome.classList.add("is-visible");
  journeyChrome.setAttribute("aria-hidden", "false");

  if (scramble && !journeyChromeVisible) {
    journeyChromeScrambles.forEach((el, index) => {
      const finalText = el.dataset.text || el.textContent || "";
      scrambleToEnglish(el, finalText, index * 120);
    });
  }

  journeyChromeVisible = true;
}

function syncJourneyChromeScene(sceneKey) {
  if (!journeyChromeVisible) return;
  const projectKey = railProjectByScene[sceneKey];
  if (!projectKey) return;
  setJourneyChromeActive(projectKey);
}

function setJourneyMenuOpen(open) {
  journeyMenuOpen = open;
  if (open && typeof window.__dismissProjectPopover === "function") {
    window.__dismissProjectPopover();
  }
  if (open) {
    setProjectPopoverExpanded(false);
  }
  document.body.classList.toggle("is-journey-menu-open", open);
  if (journeyMenuToggle) {
    journeyMenuToggle.classList.toggle("is-open", open);
    journeyMenuToggle.setAttribute("aria-expanded", String(open));
    journeyMenuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (journeyMobileMenu) {
    journeyMobileMenu.classList.toggle("is-visible", open);
    journeyMobileMenu.setAttribute("aria-hidden", String(!open));
  }
}

const caseStudySrcByScene = {
  s4: "./projects/kindling/kindling-case-study.html",
  s7: "./projects/thinktum/thinktum-case-study.html",
  s9: "./projects/lpc/little-potato-case-study.html",
  s11: "./projects/reignite/assets/reignite-case-study-final.html",
  s14: "./projects/ecomNW/assets/northwest-case-study.html",
};

function buildCaseStudyOverlaySrc(src) {
  const url = new URL(src, window.location.href);
  url.searchParams.set("v", String(Date.now()));
  return url.toString();
}

function openCaseStudyOverlay(sceneKey, holdUntilReady = null) {
  const src = caseStudySrcByScene[sceneKey];
  if (!src || !caseStudyOverlay || !caseStudyOverlayFrame) return false;
  const journey = document.getElementById("scrollJourney");
  pendingCaseStudyReadiness = typeof holdUntilReady === "function" ? holdUntilReady : null;

  if (caseStudyOverlayUnloadTimer) {
    window.clearTimeout(caseStudyOverlayUnloadTimer);
    caseStudyOverlayUnloadTimer = 0;
  }

  if (journey) {
    journey.style.overflowY = "hidden";
  }

  caseStudyOverlay.setAttribute("aria-hidden", "false");
  caseStudyOverlay.classList.add("is-visible");
  caseStudyOverlayFrame.setAttribute("src", buildCaseStudyOverlaySrc(src));
  return true;
}

function closeCaseStudyOverlay() {
  if (!caseStudyOverlay || !caseStudyOverlayFrame) return;
  const journey = document.getElementById("scrollJourney");

  caseStudyOverlay.classList.remove("is-visible");
  caseStudyOverlay.setAttribute("aria-hidden", "true");

  const releaseJourneyWhenReady = () => {
    if (!journey) return;
    const readiness = pendingCaseStudyReadiness;
    if (!readiness || readiness()) {
      pendingCaseStudyReadiness = null;
      clearCaseStudyReadinessHold();
      journey.style.overflowY = "scroll";
      return;
    }
    journey.style.overflowY = "hidden";
    if (!releaseCaseStudyReadinessTouchHold) {
      releaseCaseStudyReadinessTouchHold = pushTouchScrollHold();
    }
    window.setTimeout(releaseJourneyWhenReady, 120);
  };
  releaseJourneyWhenReady();

  if (caseStudyOverlayUnloadTimer) {
    window.clearTimeout(caseStudyOverlayUnloadTimer);
  }
  caseStudyOverlayUnloadTimer = window.setTimeout(() => {
    caseStudyOverlayFrame.setAttribute("src", "about:blank");
    caseStudyOverlayUnloadTimer = 0;
  }, 360);
}

function openAboutOverlay() {
  if (!aboutOverlay) return false;
  const journey = document.getElementById("scrollJourney");

  if (typeof window.__dismissProjectPopover === "function") {
    window.__dismissProjectPopover();
  }

  closeCaseStudyOverlay();

  if (journey) {
    journey.style.overflowY = "hidden";
  }

  aboutOverlay.setAttribute("aria-hidden", "false");
  aboutOverlay.classList.add("is-visible");
  aboutOverlayVisible = true;
  return true;
}

function closeAboutOverlay() {
  if (!aboutOverlay) return;
  const journey = document.getElementById("scrollJourney");

  aboutOverlay.classList.remove("is-visible");
  aboutOverlay.setAttribute("aria-hidden", "true");
  aboutOverlayVisible = false;

  if (journey) {
    journey.style.overflowY = "scroll";
  }
}

function ensureVisualLoop() {
  if (visualLoopRafId !== null) {
    return;
  }

  const tick = (now) => {
    if (typeof journeyFrameCallback === "function") {
      journeyFrameCallback(now);
    }
    if (typeof mistFrameCallback === "function") {
      mistFrameCallback(now);
    }
    visualLoopRafId = window.requestAnimationFrame(tick);
  };

  visualLoopRafId = window.requestAnimationFrame(tick);
}

function toBrahmiNumber(value) {
  return String(value)
    .padStart(3, "0")
    .split("")
    .map((digit) => brahmiDigits[Number(digit)])
    .join("");
}

function randomGlyph() {
  return brahmiGlyphs[Math.floor(Math.random() * brahmiGlyphs.length)];
}

function scrambleToEnglish(element, finalText, delay = 0) {
  const reveal = [...finalText];
  let frame = 0;
  const total = reveal.length + 14;

  setTimeout(() => {
    const timer = setInterval(() => {
      element.textContent = reveal
        .map((char, index) => {
          if (char === " ") {
            return " ";
          }

          if (frame > index + 5) {
            return char;
          }

          return randomGlyph();
        })
        .join("");

      frame += 1;

      if (frame > total) {
        clearInterval(timer);
        element.textContent = finalText;
      }
    }, 55);
  }, delay);
}

function primeScrambleText(element, finalText) {
  element.textContent = [...finalText]
    .map((char) => (char === " " ? " " : randomGlyph()))
    .join("");
}

function buildGlyphField() {
  if (!scriptField) {
    return;
  }

  scriptField.innerHTML = "";
  glyphs = [];

  const chars = [
    "𑀓", "𑀔", "𑀕", "𑀘", "𑀚", "𑀝", "𑀞", "𑀢", "𑀣",
    "𑀤", "𑀥", "𑀦", "𑀧", "𑀨", "𑀫", "𑀬", "𑀭", "𑀮", "𑀯", "𑀲"
  ];

  const isMobile = window.innerWidth <= 900;
  const gap = 9;
  const padding = isMobile ? 24 : 34;
  const targetCell = isMobile ? 38 : 42;
  const usableWidth = Math.max(window.innerWidth - padding * 2, 320);
  const usableHeight = Math.max(window.innerHeight - padding * 2, 320);
  const columns = Math.max(10, Math.floor(usableWidth / (targetCell + gap)));
  const rows = Math.max(10, Math.floor(usableHeight / (targetCell + gap)));
  const total = columns * rows;
  currentColumns = columns;

  scriptField.style.setProperty('--glyph-gap', `${gap}px`);
  scriptField.style.setProperty('--glyph-padding', `${padding}px`);
  scriptField.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  scriptField.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let i = 0; i < total; i += 1) {
    const glyph = document.createElement("span");
    glyph.className = "script-glyph";
    glyph.textContent = chars[Math.floor(Math.random() * chars.length)];
    glyph.dataset.index = String(i);
    scriptField.appendChild(glyph);
    glyphs.push(glyph);
  }

  glyphs.forEach((glyph, index) => {
    glyph.addEventListener("mouseenter", (event) => activateGlyphCluster(index, columns, event.currentTarget));
  });

  scriptField.addEventListener("mouseleave", () => {
    hoveredGlyphIndex = -1;
    clearGlyphStates();
  });

  startAutoFlash();
}

function clearGlyphStates() {
  glyphs.forEach((glyph) => glyph.classList.remove("active", "near"));
  if (screenScriptLayer) {
    screenScriptLayer.classList.remove("is-active");
  }
}

function clearAutoFlashStates() {
  glyphs.forEach((glyph) => glyph.classList.remove("auto-active"));
  if (screenScriptLayer && hoveredGlyphIndex === -1) {
    screenScriptLayer.classList.remove("is-active");
  }
}

function activateGlyphCluster(index, columns, target) {
  hoveredGlyphIndex = index;
  clearAutoFlashStates();
  clearGlyphStates();

  const row = Math.floor(index / columns);
  const col = index % columns;

  glyphs.forEach((glyph, i) => {
    const r = Math.floor(i / columns);
    const c = i % columns;
    const dx = Math.abs(c - col);
    const dy = Math.abs(r - row);

    if (dx <= 1 && dy <= 1) {
      glyph.classList.add("active");
    }
  });

  if (screenScriptLayer && target) {
    screenScriptLayer.classList.add("is-active");
  }
}

function flashGlyphCluster(index, columns) {
  clearAutoFlashStates();

  const row = Math.floor(index / columns);
  const col = index % columns;

  glyphs.forEach((glyph, i) => {
    const r = Math.floor(i / columns);
    const c = i % columns;
    const dx = Math.abs(c - col);
    const dy = Math.abs(r - row);

    if (dx <= 1 && dy <= 1) {
      glyph.classList.add("auto-active");
    }
  });

  if (screenScriptLayer) {
    screenScriptLayer.classList.add("is-active");
  }

  window.clearTimeout(autoFlashClearTimer);
  autoFlashClearTimer = window.setTimeout(() => {
    clearAutoFlashStates();
  }, 320);
}

function triggerAutoFlash() {
  if (!glyphs.length || hoveredGlyphIndex !== -1 || !currentColumns) {
    return;
  }

  const rows = Math.ceil(glyphs.length / currentColumns);
  const minRow = Math.min(2, Math.max(0, rows - 1));
  const maxRow = Math.max(minRow, rows - 3);
  const minCol = Math.min(2, Math.max(0, currentColumns - 1));
  const maxCol = Math.max(minCol, currentColumns - 3);

  const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
  const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;
  const index = row * currentColumns + col;

  if (index < glyphs.length) {
    flashGlyphCluster(index, currentColumns);
  }
}

function startAutoFlash() {
  window.clearInterval(autoFlashIntervalId);
  window.clearTimeout(autoFlashClearTimer);

  autoFlashIntervalId = window.setInterval(() => {
    triggerAutoFlash();
  }, 1700);
}

function updateViewportVars() {
  applyViewportMode();
  const maxWidth = Math.min(window.innerWidth, window.innerHeight * (16 / 9));
  const maxHeight = maxWidth / (16 / 9);
  const marginX = window.innerWidth > 900 ? window.innerWidth * 0.56 : window.innerWidth * 0.78;
  const marginY = (window.innerHeight - (window.innerWidth > 900 ? 160 : 224)) * (16 / 9);
  const introWidth = Math.min(marginX, marginY, maxWidth);
  document.documentElement.style.setProperty("--final-width", `${maxWidth}px`);
  document.documentElement.style.setProperty("--final-height", `${maxHeight}px`);
}

function setMouseMotion() {}

function resetMouseMotion() {
  clearGlyphStates();
}

function hideLoader() {
  loadingScreen.classList.add("is-hidden");

  document.body.classList.remove("is-opening-visible");
  document.body.classList.remove("is-opening-cta-visible");
  if (introText) {
    introText.classList.remove("is-fading");
  }
  introLines.forEach((line) => line && line.classList.remove("is-visible"));

  const openingReveal = () => {
    document.body.classList.add("is-opening-visible");
    if (introLines[0]) {
      introLines[0].classList.add("is-visible");
    }
    window.setTimeout(() => {
      if (introLines[1]) {
        introLines[1].classList.add("is-visible");
      }
    }, 1500);

    window.setTimeout(() => {
      document.body.classList.add("is-opening-cta-visible");
      if (walkButton) {
        scrambleToEnglish(walkButton, walkButton.dataset.text, 0);
      }
      if (enterSilentButton) {
        scrambleToEnglish(enterSilentButton, enterSilentButton.dataset.text, 0);
      }
    }, 5600);
  };

  window.setTimeout(openingReveal, 140);
}

function startLoadingAnimation() {
  const stream = ensureIntroStream();
  const contactStreams = ensureContactPreloadStreams();
  const minVisibleUntil = performance.now() + 1300;
  let displayedProgress = 0;

  const setProgress = (value) => {
    const nextProgress = Math.max(0, Math.min(100, Math.round(value)));
    displayedProgress = Math.max(displayedProgress, nextProgress);
    englishCount.textContent = String(displayedProgress).padStart(3, "0");
    brahmiCount.textContent = toBrahmiNumber(100 - displayedProgress);
  };

  if (!stream || typeof stream.countLoadedInRange !== "function") {
    setProgress(100);
    setTimeout(hideLoader, 220);
    return;
  }

  stream.preloadRange(0, introTotalFrames);
  stream.setTarget(0, performance.now());
  stream.draw(0);
  contactStreams.forEach(({ stream: contactStream, totalFrames }) => {
    contactStream.retainLoadedFrames();
    contactStream.preloadRange(0, totalFrames);
    contactStream.setTarget(0, performance.now());
  });

  const tick = () => {
    const now = performance.now();
    stream.processQueue(now, true);
    contactStreams.forEach(({ stream: contactStream }) => {
      contactStream.processQueue(now, true);
    });
    const introLoaded = stream.countLoadedInRange(0, introTotalFrames);
    const contactLoaded = contactStreams.reduce((sum, { stream: contactStream, totalFrames }) => {
      return sum + contactStream.countLoadedInRange(0, totalFrames);
    }, 0);
    const totalFramesToLoad = introTotalFrames + contactStreams.reduce((sum, { totalFrames }) => sum + totalFrames, 0);
    const totalLoaded = introLoaded + contactLoaded;
    setProgress((totalLoaded / totalFramesToLoad) * 100);

    const ready = totalLoaded >= totalFramesToLoad;
    const pastMinimum = performance.now() >= minVisibleUntil;

    if (ready && pastMinimum) {
      introFramesReadyBeforeSequence = ready;
      setProgress(100);
      setTimeout(hideLoader, 220);
      return;
    }

    window.setTimeout(tick, 80);
  };

  tick();
}

function startExperience() {
  if (document.body.classList.contains("is-sequence-started")) {
    return;
  }

  sequenceTimers.forEach((timer) => window.clearTimeout(timer));
  sequenceTimers = [];

  const ambientBase     = document.querySelector(".ambient--base");
  const ambientHalo     = document.querySelector(".ambient--halo");
  const ambientWater    = document.querySelector(".ambient--waterline");
  const ambientVignette = document.querySelector(".ambient--vignette");
  const overlayText     = document.querySelector(".intro-overlay__text");
  const nightWorld      = document.getElementById("nightWorld");

  // Freeze only what snaps on body-class change — use inline styles so CSS rules can't interfere
  const freezeProp = (el, prop) => {
    if (!el) return;
    const val = window.getComputedStyle(el).getPropertyValue(prop);
    if (val) el.style.setProperty(prop, val);
  };

  // Ambient opacities snap when not(is-sequence-started) drops
  freezeProp(ambientHalo,  "opacity");
  freezeProp(ambientWater, "opacity");
  // Halo inset snaps — lock it with known values from the CSS
  if (ambientHalo) {
    ambientHalo.style.top    = "10%";
    ambientHalo.style.right  = "18%";
    ambientHalo.style.bottom = "18%";
    ambientHalo.style.left   = "18%";
  }
  // Overlay text position snaps
  if (overlayText) {
    freezeProp(overlayText, "gap");
    freezeProp(overlayText, "transform");
  }

  // Helper: fade an element to a target opacity over duration ms
  const fadeEl = (el, toOpacity, durationMs) => {
    if (!el) return;
    el.style.transition = `opacity ${durationMs}ms ease`;
    el.style.opacity    = String(toOpacity);
  };

  // ── Step 1: Glyphs ash-dissolve ──────────────────────────────────────────
  document.body.classList.add("is-sequence-started", "is-opening-glyph-exit");
  document.body.classList.remove("is-opening-cta-visible");
  document.body.classList.remove(
    "is-text-exiting",
    "is-smoke-intense",
    "is-video-rising",
    "is-video-surfacing",
    "is-world-faded"
  );
  if (walkButton) walkButton.blur();
  clearGlyphStates();
  clearAutoFlashStates();

  glyphs.forEach((glyph) => {
    glyph.style.setProperty("--ash-x", `${(Math.random() - 0.5) * 42}px`);
    glyph.style.setProperty("--ash-y", `${-48 - Math.random() * 88}px`);
    glyph.style.setProperty("--ash-delay", `${Math.random() * 400}ms`);
  });

  const later = (delay, fn) => {
    const id = window.setTimeout(fn, delay);
    sequenceTimers.push(id);
  };

  // ── Step 2: Text exits ───────────────────────────────────────────────────
  const GLYPH_DONE = 1450;
  later(GLYPH_DONE, () => {
    if (overlayText) {
      overlayText.style.removeProperty("gap");
      overlayText.style.removeProperty("transform");
    }
    document.body.classList.add("is-text-exiting");
    void document.body.offsetHeight;
    introLines.forEach((line) => line && line.classList.remove("is-visible"));
  });

  // ── Step 3: Smoke intensifies; video rises behind it ────────────────────
  const TEXT_DONE = GLYPH_DONE + 1450;
  later(TEXT_DONE, () => {
    document.body.classList.add("is-smoke-intense");
    if (introOverlay) introOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.add("is-video-rising");
  });

  const VEIL_DONE = TEXT_DONE;
  later(VEIL_DONE + 3000, () => {
    prepareIntroScrollMode();
  });

  later(VEIL_DONE + 3150, () => {
    activateIntroScrollMode();
  });

  // ── Step 4: Smoke clears, video is fully visible ────────────────────────
  // ── Cleanup ──────────────────────────────────────────────────────────────
  later(VEIL_DONE + 3700, () => {
    window.clearInterval(autoFlashIntervalId);
  });
}

window.addEventListener("resize", updateViewportVars);
window.addEventListener("resize", buildGlyphField);
window.addEventListener("resize", resizeIntroCanvas);
window.addEventListener("mousemove", setMouseMotion);
window.addEventListener("mouseleave", resetMouseMotion);
if (introScrollJourney) {
  introScrollJourney.addEventListener("scroll", handleIntroScrollInput, { passive: true });
  introScrollJourney.addEventListener("wheel", (event) => {
    if (!introScrollActive || introScrollTransitioning) return;
    debugIntroScroll("wheel", {
      deltaY: Math.round(event.deltaY),
      scrollTop: Math.round(introScrollJourney.scrollTop),
    }, 120);
  }, { passive: true });
  bindTouchScroller(introScrollJourney, handleIntroScrollInput);
}
if (scrollJourney) {
  bindTouchScroller(scrollJourney);
}
walkButton.addEventListener("click", () => {
  setSoundEnabled(true, true);
  startSiteMusicWithEntryRetries();
  requestMotionFromGesture();
  startExperience();
});

if (enterSilentButton) {
  enterSilentButton.addEventListener("click", () => {
    setSoundEnabled(false, false, false);
    requestMotionFromGesture();
    startExperience();
  });
}

function createSceneFrameStream({ basePath, totalFrames, canvas, sceneKey = "" }) {
  let activeCanvas = canvas;
  let ctx = activeCanvas.getContext("2d");
  const cache = new Map();
  const loading = new Map();
  let lastDrawnIndex = 0;
  let lastPaintedIndex = null;
  let lastRequestedIndex = null;
  let desiredIndex = 0;
  let warmRange = null;
  let retainFullCache = false;
  let lastQueueRun = 0;
  let paused = document.visibilityState === "hidden";
  const resolvedBasePath = resolveFrameBasePath(basePath);
  const maxBehind = sceneKey === "intro" ? 8 : 12;
  const maxAhead = sceneKey === "intro" ? 40 : 60;
  const nearbyRadius = sceneKey === "intro" ? 6 : 8;
  const maxConcurrency = 8;
  const throttleMs = 16;

  function drawCoverImage(img) {
    const canvasWidth = activeCanvas.width;
    const canvasHeight = activeCanvas.height;
    const imageWidth = img.naturalWidth || img.width;
    const imageHeight = img.naturalHeight || img.height;

    if (!canvasWidth || !canvasHeight || !imageWidth || !imageHeight) {
      return;
    }

    const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const offset = getSceneFrameOffset(sceneKey);
    const maxOffsetX = Math.max(0, drawWidth - canvasWidth) / 2;
    const maxOffsetY = Math.max(0, drawHeight - canvasHeight) / 2;
    const drawX = (canvasWidth - drawWidth) / 2 - maxOffsetX * offset.x;
    const drawY = (canvasHeight - drawHeight) / 2 - maxOffsetY * offset.y;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  function frameSrc(index) {
    return `${resolvedBasePath}/frame${String(index + 1).padStart(4, "0")}.jpg`;
  }

  function loadFrame(index) {
    if (index < 0 || index >= totalFrames || cache.has(index) || loading.has(index) || paused) {
      return;
    }

    const img = new Image();
    img.decoding = "async";
    loading.set(index, img);

    const cleanup = () => {
      loading.delete(index);
      processQueue(performance.now(), true);
    };

    img.onload = () => {
      cleanup();
      if (img.naturalWidth > 0) {
        cache.set(index, img);
      }
    };

    img.onerror = cleanup;
    img.src = frameSrc(index);
  }

  function buildPriorityList(center) {
    const prioritized = [];
    const seen = new Set();

    const push = (index) => {
      if (index < 0 || index >= totalFrames || seen.has(index)) return;
      seen.add(index);
      prioritized.push(index);
    };

    push(center);
    for (let offset = 1; offset <= nearbyRadius; offset += 1) {
      push(center - offset);
      push(center + offset);
    }
    for (let offset = nearbyRadius + 1; offset <= maxAhead; offset += 1) {
      push(center + offset);
    }
    for (let offset = nearbyRadius + 1; offset <= maxBehind; offset += 1) {
      push(center - offset);
    }

    return prioritized;
  }

  function syncCacheWindow(center) {
    desiredIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(center)));
    if ((sceneKey === "intro" && introFramesReadyBeforeSequence) || retainFullCache) {
      return;
    }

    const keepMin = Math.max(0, desiredIndex - maxBehind);
    const keepMax = Math.min(totalFrames - 1, desiredIndex + maxAhead);

    for (const index of cache.keys()) {
      if (index < keepMin || index > keepMax) {
        cache.delete(index);
      }
    }
  }

  function processQueue(now = performance.now(), force = false) {
    if (paused || (!force && now - lastQueueRun < throttleMs) || (!isVisible() && cache.size > 0 && !warmRange)) {
      return;
    }
    lastQueueRun = now;

    const priorities = buildPriorityList(desiredIndex);
    if (warmRange) {
      for (let index = warmRange.start; index < warmRange.end; index += 1) {
        if (!cache.has(index)) {
          priorities.push(index);
        }
      }
      const rangeComplete = Array.from(
        { length: warmRange.end - warmRange.start },
        (_, offset) => warmRange.start + offset
      ).every((index) => cache.has(index));
      if (rangeComplete) {
        warmRange = null;
      }
    }

    for (const index of priorities) {
      if (loading.size >= maxConcurrency) {
        break;
      }
      loadFrame(index);
    }
  }

  function draw(index) {
    const clampedIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
    const img = cache.get(clampedIndex);
    if (img && img.complete && img.naturalWidth > 0) {
      if (lastPaintedIndex === clampedIndex && lastRequestedIndex === clampedIndex) {
        return;
      }
      drawCoverImage(img);
      lastDrawnIndex = clampedIndex;
      lastPaintedIndex = clampedIndex;
      lastRequestedIndex = clampedIndex;
      return;
    }

    const fallback = cache.get(lastDrawnIndex);
    if (fallback && fallback.complete && fallback.naturalWidth > 0) {
      if (lastPaintedIndex === lastDrawnIndex && lastRequestedIndex === clampedIndex) {
        return;
      }
      drawCoverImage(fallback);
      lastPaintedIndex = lastDrawnIndex;
      lastRequestedIndex = clampedIndex;
    }
  }

  function setTarget(index, now) {
    syncCacheWindow(index);
    processQueue(now);
  }

  function clear(keepIndex = null) {
    const normalizedKeepIndex = keepIndex === null ? null : Math.max(0, Math.min(totalFrames - 1, Math.round(keepIndex)));
    const keep = normalizedKeepIndex === null ? null : cache.get(normalizedKeepIndex);
    cache.clear();
    loading.clear();
    warmRange = null;
    retainFullCache = false;
    if (stream) {
      stream._warmed = false;
    }
    lastPaintedIndex = null;
    lastRequestedIndex = null;
    if (keep) {
      cache.set(normalizedKeepIndex, keep);
      lastDrawnIndex = normalizedKeepIndex;
    }
  }

  function resizeToViewport() {
    activeCanvas.width = window.innerWidth;
    activeCanvas.height = window.innerHeight;
    lastPaintedIndex = null;
    lastRequestedIndex = null;
    draw(lastDrawnIndex);
  }

  function redraw() {
    lastPaintedIndex = null;
    lastRequestedIndex = null;
    draw(lastDrawnIndex);
  }

  function isVisible() {
    if (!activeCanvas.isConnected) return false;
    if (sceneKey === "intro") {
      return introScrollActive || activeCanvas.offsetParent !== null;
    }
    const opacity = Number.parseFloat(activeCanvas.style.opacity || window.getComputedStyle(activeCanvas).opacity || "1");
    return opacity > 0.01;
  }

  function attachCanvas(nextCanvas) {
    if (!nextCanvas || nextCanvas === activeCanvas) return;
    activeCanvas = nextCanvas;
    ctx = activeCanvas.getContext("2d");
    resizeToViewport();
  }

  function prime(index = 0) {
    desiredIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
    loadFrame(desiredIndex);
  }

  function preloadRange(startIndex, count) {
    const start = Math.max(0, Math.min(totalFrames - 1, Math.round(startIndex)));
    const end = Math.min(start + count, totalFrames);
    warmRange = { start, end };
    desiredIndex = start;
    processQueue(performance.now(), true);
  }

  function countLoadedInRange(startIndex = 0, count = totalFrames) {
    const start = Math.max(0, Math.min(totalFrames - 1, Math.round(startIndex)));
    const end = Math.min(start + count, totalFrames);
    let loaded = 0;
    for (let index = start; index < end; index += 1) {
      if (cache.has(index)) loaded += 1;
    }
    return loaded;
  }

  function retainLoadedFrames() {
    retainFullCache = true;
  }

  function getDebugState(targetIndex = desiredIndex) {
    const clampedIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(targetIndex)));
    return {
      cacheSize: cache.size,
      loadingSize: loading.size,
      desiredIndex,
      lastDrawnIndex,
      lastPaintedIndex,
      lastRequestedIndex,
      hasTarget: cache.has(clampedIndex),
      isTargetLoading: loading.has(clampedIndex),
      visible: isVisible(),
      retainFullCache,
      warmRange,
    };
  }

  document.addEventListener("visibilitychange", () => {
    paused = document.visibilityState === "hidden";
    if (!paused) {
      processQueue(performance.now());
    }
  });

  const stream = {
    cache,
    get canvas() {
      return activeCanvas;
    },
    attachCanvas,
    clear,
    draw,
    prime,
    preloadRange,
    countLoadedInRange,
    retainLoadedFrames,
    processQueue,
    redraw,
    resizeToViewport,
    getDebugState,
    isVisible,
    setTarget,
  };
  sceneFrameStreams.push(stream);
  return stream;
}

function resizeIntroCanvas() {
  if (!introSceneCanvas) return;
  introSceneCanvas.width = window.innerWidth;
  introSceneCanvas.height = window.innerHeight;
}

function ensureIntroStream() {
  if (!introSceneCanvas) return null;
  if (introStream) return introStream;
  resizeIntroCanvas();
  introStream = createSceneFrameStream({
    basePath: "./assets/palace-intro-frames",
    totalFrames: introTotalFrames,
    canvas: introSceneCanvas,
    sceneKey: "intro",
  });
  return introStream;
}

function createPreloadCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  canvas.style.position = "fixed";
  canvas.style.width = "1px";
  canvas.style.height = "1px";
  canvas.style.opacity = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.visibility = "hidden";
  canvas.style.left = "-10px";
  canvas.style.top = "-10px";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  return canvas;
}

function ensureContactPreloadStreams() {
  if (!contactPreloadS15Stream) {
    contactPreloadS15Stream = createSceneFrameStream({
      basePath: "./assets/scene15-frames-1600",
      totalFrames: 289,
      canvas: createPreloadCanvas(),
      sceneKey: "s15",
    });
  }
  if (!contactPreloadS16Stream) {
    contactPreloadS16Stream = createSceneFrameStream({
      basePath: "./assets/scene16-frames-1600",
      totalFrames: 121,
      canvas: createPreloadCanvas(),
      sceneKey: "s16",
    });
  }
  return [
    { stream: contactPreloadS15Stream, totalFrames: 289 },
    { stream: contactPreloadS16Stream, totalFrames: 121 },
  ];
}

function ensureOpeningWorldPreloadStreams() {
  if (!openingPreloadS2Stream) {
    openingPreloadS2Stream = createSceneFrameStream({
      basePath: "./assets/scene2-frames-1600",
      totalFrames: 121,
      canvas: createPreloadCanvas(),
      sceneKey: "s2",
    });
  }
  if (!openingPreloadS3Stream) {
    openingPreloadS3Stream = createSceneFrameStream({
      basePath: "./assets/scene3-frames-1600",
      totalFrames: 289,
      canvas: createPreloadCanvas(),
      sceneKey: "s3",
    });
  }
  return [
    { stream: openingPreloadS2Stream, totalFrames: 121, preloadFrames: 121, readyFrames: 121 },
    { stream: openingPreloadS3Stream, totalFrames: 289, preloadFrames: 160, readyFrames: 160 },
  ];
}

function createWayfinderHoldReadiness() {
  const preloadStreams = ensureOpeningWorldPreloadStreams();
  preloadStreams.forEach(({ stream }) => {
    if (typeof stream.retainLoadedFrames === "function") {
      stream.retainLoadedFrames();
    }
  });

  return () => {
    const now = performance.now();
    let ready = true;
    preloadStreams.forEach(({ stream, preloadFrames, readyFrames }) => {
      stream.preloadRange(0, preloadFrames);
      stream.setTarget(0, now);
      stream.processQueue(now, true);
      if (stream.countLoadedInRange(0, preloadFrames) < readyFrames) {
        ready = false;
      }
    });
    return ready;
  };
}

function prepareIntroScrollMode() {
  const now = performance.now();
  introScrollUnlockAt = now;
  introScrollSafetyWaitUntil = now + 650;
  document.body.classList.add("is-video-surfacing", "is-intro-frame-ready");
  const stream = ensureIntroStream();
  if (stream) {
    stream.preloadRange(0, introTotalFrames);
    stream.setTarget(0, performance.now());
    stream.draw(0);
  }
}

function setIntroScrollPromptVisible(visible) {
  document.body.classList.toggle("is-scroll-prompt-visible", visible);
}

function activateIntroScrollMode() {
  if (introScrollTransitioning) return;
  const now = performance.now();
  const stream = ensureIntroStream();
  const loadedIntroFrames = typeof stream?.countLoadedInRange === "function"
    ? stream.countLoadedInRange(0, introTotalFrames)
    : 0;
  const waitingForMinimumHold = now < introScrollUnlockAt;
  const waitingForFirstFrame = loadedIntroFrames < 1 && now < introScrollSafetyWaitUntil;
  if (waitingForMinimumHold || waitingForFirstFrame) {
    const nextCheckDelay = waitingForMinimumHold
      ? Math.max(80, introScrollUnlockAt - now)
      : 80;
    window.setTimeout(activateIntroScrollMode, nextCheckDelay);
    return;
  }

  introScrollActive = true;
  introScrollComplete = false;
  introScrollProgress = 0;
  introScrollTargetProgress = 0;
  document.body.classList.add("is-video-surfacing", "is-intro-scroll-active");
  document.body.classList.remove("is-intro-handoff-active");
  setIntroScrollPromptVisible(true);
  if (introScrollJourney) {
    introScrollJourney.classList.add("is-active");
    introScrollJourney.setAttribute("aria-hidden", "false");
    introScrollJourney.scrollTop = 0;
    debugIntroScroll("activated", {
      scrollHeight: Math.round(introScrollJourney.scrollHeight),
      clientHeight: Math.round(introScrollJourney.clientHeight),
      maxScrollTop: Math.round(introScrollJourney.scrollHeight - introScrollJourney.clientHeight),
    });
  }

  if (stream) {
    stream.prime(0);
    stream.setTarget(0, performance.now());
    stream.draw(0);
  }

  if (introScrollRafId !== null) {
    window.cancelAnimationFrame(introScrollRafId);
  }
  introScrollRafId = window.requestAnimationFrame(runIntroScrollFrame);
}

function syncIntroTargetProgress() {
  if (!introScrollJourney) return;
  const maxScrollTop = Math.max(1, introScrollJourney.scrollHeight - introScrollJourney.clientHeight);
  introScrollTargetProgress = progressFromScrollPosition(introScrollJourney.scrollTop, maxScrollTop);
}

function handleIntroScrollInput() {
  if (!introScrollActive || introScrollTransitioning) return;
  syncIntroTargetProgress();
  debugIntroScroll("scroll", {
    scrollTop: Math.round(introScrollJourney?.scrollTop || 0),
    targetProgress: Number(introScrollTargetProgress.toFixed(4)),
  }, 120);
}

function handoffFromIntroScroll() {
  if (introScrollTransitioning || introScrollComplete) return;

  introScrollComplete = true;
  introScrollActive = false;
  introScrollTransitioning = true;

  if (introScrollRafId !== null) {
    window.cancelAnimationFrame(introScrollRafId);
    introScrollRafId = null;
  }

  document.body.classList.remove("is-intro-scroll-active");
  document.body.classList.remove("is-intro-frame-ready");
  document.body.classList.add("is-intro-handoff-active");
  setIntroScrollPromptVisible(false);
  if (introScrollJourney) {
    introScrollJourney.classList.remove("is-active");
    introScrollJourney.setAttribute("aria-hidden", "true");
    introScrollJourney.scrollTop = 0;
  }

  const activateJourney = () => {
    document.body.classList.remove("is-intro-handoff-active");
    introScrollTransitioning = false;
    beginScrollJourney();
    window.setTimeout(() => {
      document.body.classList.add("is-scroll-prompt-visible");
    }, 200);
  };

  if (thresholdController) {
    showWorldOverlay(() => {
      if (typeof window !== "undefined") {
        window.__scene2ThresholdSeen = true;
      }
      activateJourney();
    }, {
      scroller: introScrollJourney,
      holdUntilReady: createWayfinderHoldReadiness(),
      maxHoldDuration: Number.POSITIVE_INFINITY,
    });
  } else {
    activateJourney();
  }
}

function runIntroScrollFrame(now) {
  if (!introScrollActive) {
    introScrollRafId = null;
    return;
  }

  const stream = ensureIntroStream();
  if (!stream) {
    introScrollRafId = null;
    return;
  }

  introScrollProgress += (introScrollTargetProgress - introScrollProgress) * 0.18;
  if (Math.abs(introScrollTargetProgress - introScrollProgress) < 0.0005) {
    introScrollProgress = introScrollTargetProgress;
  }

  const targetFrame = progressToFrameIndex(introScrollProgress);
  stream.setTarget(targetFrame, now);
  stream.draw(targetFrame);
  debugIntroScroll("frame", {
    scrollTop: Math.round(introScrollJourney?.scrollTop || 0),
    targetProgress: Number(introScrollTargetProgress.toFixed(4)),
    renderProgress: Number(introScrollProgress.toFixed(4)),
    targetFrame,
    stream: typeof stream.getDebugState === "function" ? stream.getDebugState(targetFrame) : null,
  }, 250);

  if (shouldCompleteIntro(introScrollProgress, introScrollTargetProgress)) {
    handoffFromIntroScroll();
    return;
  }

  introScrollRafId = window.requestAnimationFrame(runIntroScrollFrame);
}

function beginScrollJourney() {
  const journey = document.getElementById("scrollJourney");
  if (journey.dataset.started === "true") return;
  journey.dataset.started = "true";
  if (fluidBgController) {
    fluidBgController.destroy();
    fluidBgController = null;
  }
  journey.classList.add("is-active");
  document.documentElement.style.overflow = "hidden";

  const scene2 = document.getElementById("scene2");
  const scene3 = document.getElementById("scene3");
  const scene4 = document.getElementById("scene4");
  const scene5 = document.getElementById("scene5");
  const scene6 = document.getElementById("scene6");
  const scene7 = document.getElementById("scene7");
  const scene8 = document.getElementById("scene8");
  const scene9 = document.getElementById("scene9");
  const scene10 = document.getElementById("scene10");
  const scene11 = document.getElementById("scene11");
  const scene12 = document.getElementById("scene12");
  const scene13 = document.getElementById("scene13");
  const scene14 = document.getElementById("scene14");
  const scene15 = document.getElementById("scene15");
  const scene16 = document.getElementById("scene16");
  const s2Height = window.innerHeight * 4;
  const s3Height = window.innerHeight * 7;
  const s4Height = window.innerHeight * 6;
  const s5Height = 0;
  const s6Height = window.innerHeight * 6;
  const s7Height = window.innerHeight * 4;
  const s8Height = window.innerHeight * 6;
  const s9Height = window.innerHeight * 6;
  const s10Height = window.innerHeight * 6;
  const s11Height = window.innerHeight * 6;
  const s12Height = 0;
  const s13Height = window.innerHeight * 6;
  const s14Height = window.innerHeight * 5;
  const s15Height = window.innerHeight * 7;
  const s16Height = window.innerHeight * 4;
  scene2.style.height = s2Height + "px";
  scene3.style.height = s3Height + "px";
  scene4.style.height = s4Height + "px";
  scene5.style.height = s5Height + "px";
  scene6.style.height = s6Height + "px";
  scene7.style.height = s7Height + "px";
  scene8.style.height = s8Height + "px";
  scene9.style.height = s9Height + "px";
  scene10.style.height = s10Height + "px";
  scene11.style.height = s11Height + "px";
  scene12.style.height = s12Height + "px";
  scene13.style.height = s13Height + "px";
  scene14.style.height = s14Height + "px";
  scene15.style.height = s15Height + "px";
  scene16.style.height = s16Height + "px";
  void journey.offsetHeight;

  const s2MaxScroll = s2Height - window.innerHeight;
  const s3Start = s2MaxScroll;
  const s4Start = s2Height + s3Height - window.innerHeight;
  const s5Start = s2Height + s3Height + s4Height - window.innerHeight;
  const s6Start = s2Height + s3Height + s4Height + s5Height - window.innerHeight;
  const s7Start = s2Height + s3Height + s4Height + s5Height + s6Height - window.innerHeight;
  const s8Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height - window.innerHeight;
  const s9Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height - window.innerHeight;
  const s10Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height + s9Height - window.innerHeight;
  const s11Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height + s9Height + s10Height - window.innerHeight;
  const s12Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height + s9Height + s10Height + s11Height - window.innerHeight;
  const s13Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height + s9Height + s10Height + s11Height + s12Height - window.innerHeight;
  const s14Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height + s9Height + s10Height + s11Height + s12Height + s13Height - window.innerHeight;
  const s15Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height + s9Height + s10Height + s11Height + s12Height + s13Height + s14Height - window.innerHeight;
  const s16Start = s2Height + s3Height + s4Height + s5Height + s6Height + s7Height + s8Height + s9Height + s10Height + s11Height + s12Height + s13Height + s14Height + s15Height - window.innerHeight;
  const s3ScrollRange = s4Start - s3Start;
  const s4ScrollRange = s5Start - s4Start;
  const s5ScrollRange = s6Start - s5Start;
  const s6ScrollRange = s7Start - s6Start;
  const s7ScrollRange = s8Start - s7Start;
  const s8ScrollRange = s9Start - s8Start;
  const s9ScrollRange = s10Start - s9Start;
  const s10ScrollRange = s11Start - s10Start;
  const s11ScrollRange = s12Start - s11Start;
  const s12ScrollRange = s13Start - s12Start;
  const s13ScrollRange = s14Start - s13Start;
  const s14ScrollRange = s15Start - s14Start;
  const s15ScrollRange = s16Start - s15Start;
  const s16ScrollRange = s16Height;
  journey.scrollTop = 0;

  const s2Canvas = document.getElementById("scene2Canvas");
  s2Canvas.width = window.innerWidth;
  s2Canvas.height = window.innerHeight;

  const s3Canvas = document.getElementById("scene3Canvas");
  s3Canvas.width = window.innerWidth;
  s3Canvas.height = window.innerHeight;
  s3Canvas.style.opacity = "0";

  const s4Canvas = document.getElementById("scene4Canvas");
  s4Canvas.width = window.innerWidth;
  s4Canvas.height = window.innerHeight;
  s4Canvas.style.opacity = "0";

  const s5Canvas = document.getElementById("scene5Canvas");
  s5Canvas.width = window.innerWidth;
  s5Canvas.height = window.innerHeight;
  s5Canvas.style.opacity = "0";

  const s6Canvas = document.getElementById("scene6Canvas");
  s6Canvas.width = window.innerWidth;
  s6Canvas.height = window.innerHeight;
  s6Canvas.style.opacity = "0";

  const s7Canvas = document.getElementById("scene7Canvas");
  s7Canvas.width = window.innerWidth;
  s7Canvas.height = window.innerHeight;
  s7Canvas.style.opacity = "0";

  const s8Canvas = document.getElementById("scene8Canvas");
  s8Canvas.width = window.innerWidth;
  s8Canvas.height = window.innerHeight;
  s8Canvas.style.opacity = "0";

  const s9Canvas = document.getElementById("scene9Canvas");
  s9Canvas.width = window.innerWidth;
  s9Canvas.height = window.innerHeight;
  s9Canvas.style.opacity = "0";

  const s10Canvas = document.getElementById("scene10Canvas");
  s10Canvas.width = window.innerWidth;
  s10Canvas.height = window.innerHeight;
  s10Canvas.style.opacity = "0";

  const s11Canvas = document.getElementById("scene11Canvas");
  s11Canvas.width = window.innerWidth;
  s11Canvas.height = window.innerHeight;
  s11Canvas.style.opacity = "0";

  const s12Canvas = document.getElementById("scene12Canvas");
  s12Canvas.width = window.innerWidth;
  s12Canvas.height = window.innerHeight;
  s12Canvas.style.opacity = "0";

  const s13Canvas = document.getElementById("scene13Canvas");
  s13Canvas.width = window.innerWidth;
  s13Canvas.height = window.innerHeight;
  s13Canvas.style.opacity = "0";

  const s14Canvas = document.getElementById("scene14Canvas");
  s14Canvas.width = window.innerWidth;
  s14Canvas.height = window.innerHeight;
  s14Canvas.style.opacity = "0";

  const s15Canvas = document.getElementById("scene15Canvas");
  s15Canvas.width = window.innerWidth;
  s15Canvas.height = window.innerHeight;
  s15Canvas.style.opacity = "0";

  const s16Canvas = document.getElementById("scene16Canvas");
  s16Canvas.width = window.innerWidth;
  s16Canvas.height = window.innerHeight;
  s16Canvas.style.opacity = "0";

  const s2Stream = openingPreloadS2Stream || createSceneFrameStream({
    basePath: "./assets/scene2-frames-1600",
    totalFrames: 121,
    canvas: s2Canvas,
    sceneKey: "s2",
  });
  if (s2Stream.canvas !== s2Canvas && typeof s2Stream.attachCanvas === "function") {
    s2Stream.attachCanvas(s2Canvas);
  }
  const s3Stream = openingPreloadS3Stream || createSceneFrameStream({
    basePath: "./assets/scene3-frames-1600",
    totalFrames: 289,
    canvas: s3Canvas,
    sceneKey: "s3",
  });
  if (s3Stream.canvas !== s3Canvas && typeof s3Stream.attachCanvas === "function") {
    s3Stream.attachCanvas(s3Canvas);
  }
  const nullStream = {
    clear() {},
    prime() {},
    draw() {},
    resizeToViewport() {},
    setTarget() {},
  };
  let s4Initialized = false;
  let s5Initialized = false;
  let s6Initialized = false;
  let s7Initialized = false;
  let s8Initialized = false;
  let s9Initialized = false;
  let s10Initialized = false;
  let s11Initialized = false;
  let s12Initialized = false;
  let s13Initialized = false;
  let s14Initialized = false;
  let s15Initialized = false;
  let s16Initialized = false;
  let s4Stream = nullStream;
  let s5Stream = nullStream;
  let s6Stream = nullStream;
  let s7Stream = nullStream;
  let s8Stream = nullStream;
  let s9Stream = nullStream;
  let s10Stream = nullStream;
  let s11Stream = nullStream;
  let s12Stream = nullStream;
  let s13Stream = nullStream;
  let s14Stream = nullStream;
  let s15Stream = nullStream;
  let s16Stream = nullStream;
  const journeyCanvases = [
    s2Canvas,
    s3Canvas,
    s4Canvas,
    s5Canvas,
    s6Canvas,
    s7Canvas,
    s8Canvas,
    s9Canvas,
    s10Canvas,
    s11Canvas,
    s12Canvas,
    s13Canvas,
    s14Canvas,
    s15Canvas,
    s16Canvas,
  ];
  let journeyResizeRaf = null;

  function getJourneyStreams() {
    return [
      s2Stream,
      s3Stream,
      s4Stream,
      s5Stream,
      s6Stream,
      s7Stream,
      s8Stream,
      s9Stream,
      s10Stream,
      s11Stream,
      s12Stream,
      s13Stream,
      s14Stream,
      s15Stream,
      s16Stream,
    ];
  }

  function resizeJourneyCanvases() {
    applyViewportMode();
    journeyCanvases.forEach((canvas) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    getJourneyStreams().forEach((stream) => stream.resizeToViewport());
  }

  function queueJourneyResize() {
    if (journeyResizeRaf) {
      window.cancelAnimationFrame(journeyResizeRaf);
    }
    journeyResizeRaf = window.requestAnimationFrame(() => {
      journeyResizeRaf = null;
      resizeJourneyCanvases();
    });
  }

  window.addEventListener("resize", queueJourneyResize);

  function ensureS4Stream() {
    if (!s4Initialized) {
      s4Stream = createSceneFrameStream({ basePath: "./assets/scene4-frames-1600", totalFrames: 121, canvas: s4Canvas, sceneKey: "s4" });
      s4Initialized = true;
    }
    return s4Stream;
  }

  function ensureS5Stream() {
    if (!s5Initialized) {
      s5Stream = createSceneFrameStream({ basePath: "./assets/scene5-frames-1600", totalFrames: 241, canvas: s5Canvas, sceneKey: "s5" });
      s5Initialized = true;
    }
    return s5Stream;
  }

  function ensureS6Stream() {
    if (!s6Initialized) {
      s6Stream = createSceneFrameStream({ basePath: "./assets/scene6-frames-1600", totalFrames: 241, canvas: s6Canvas, sceneKey: "s6" });
      s6Initialized = true;
    }
    return s6Stream;
  }

  function ensureS7Stream() {
    if (!s7Initialized) {
      s7Stream = createSceneFrameStream({ basePath: "./assets/scene7-frames-1600", totalFrames: 121, canvas: s7Canvas, sceneKey: "s7" });
      s7Initialized = true;
    }
    return s7Stream;
  }

  function ensureS8Stream() {
    if (!s8Initialized) {
      s8Stream = createSceneFrameStream({ basePath: "./assets/scene8-frames-1600", totalFrames: 241, canvas: s8Canvas, sceneKey: "s8" });
      s8Initialized = true;
    }
    return s8Stream;
  }

  function ensureS9Stream() {
    if (!s9Initialized) {
      s9Stream = createSceneFrameStream({ basePath: "./assets/scene9-frames-1600", totalFrames: 241, canvas: s9Canvas, sceneKey: "s9" });
      s9Initialized = true;
    }
    return s9Stream;
  }

  function ensureS10Stream() {
    if (!s10Initialized) {
      s10Stream = createSceneFrameStream({ basePath: "./assets/scene10-frames-1600", totalFrames: 241, canvas: s10Canvas, sceneKey: "s10" });
      s10Initialized = true;
    }
    return s10Stream;
  }

  function ensureS11Stream() {
    if (!s11Initialized) {
      s11Stream = createSceneFrameStream({ basePath: "./assets/scene11-frames-1600", totalFrames: 241, canvas: s11Canvas, sceneKey: "s11" });
      s11Initialized = true;
    }
    return s11Stream;
  }

  function ensureS12Stream() {
    if (!s12Initialized) {
      s12Stream = createSceneFrameStream({ basePath: "./assets/scene12-frames-1600", totalFrames: 241, canvas: s12Canvas, sceneKey: "s12" });
      s12Initialized = true;
    }
    return s12Stream;
  }

  function ensureS13Stream() {
    if (!s13Initialized) {
      s13Stream = createSceneFrameStream({ basePath: "./assets/scene13-frames-1600", totalFrames: 241, canvas: s13Canvas, sceneKey: "s13" });
      s13Initialized = true;
    }
    return s13Stream;
  }

  function ensureS14Stream() {
    if (!s14Initialized) {
      s14Stream = createSceneFrameStream({ basePath: "./assets/scene14-frames-1600", totalFrames: 169, canvas: s14Canvas, sceneKey: "s14" });
      s14Initialized = true;
    }
    return s14Stream;
  }

  function ensureS15Stream() {
    if (!s15Initialized) {
      s15Stream = contactPreloadS15Stream || createSceneFrameStream({ basePath: "./assets/scene15-frames-1600", totalFrames: 289, canvas: s15Canvas, sceneKey: "s15" });
      if (s15Stream.canvas !== s15Canvas && typeof s15Stream.attachCanvas === "function") {
        s15Stream.attachCanvas(s15Canvas);
      }
      s15Initialized = true;
    }
    return s15Stream;
  }

  function ensureS16Stream() {
    if (!s16Initialized) {
      s16Stream = contactPreloadS16Stream || createSceneFrameStream({ basePath: "./assets/scene16-frames-1600", totalFrames: 121, canvas: s16Canvas, sceneKey: "s16" });
      if (s16Stream.canvas !== s16Canvas && typeof s16Stream.attachCanvas === "function") {
        s16Stream.attachCanvas(s16Canvas);
      }
      s16Initialized = true;
    }
    return s16Stream;
  }
  s2Stream.prime(0);
  s3Stream.prime(0);

  let s2Frame = 0;
  let s3Frame = 0;
  let s4Frame = 0;
  let s5Frame = 0;
  let s6Frame = 0;
  let s7Frame = 0;
  let s8Frame = 0;
  let s9Frame = 0;
  let s10Frame = 0;
  let s11Frame = 0;
  let s12Frame = 0;
  let s13Frame = 0;
  let s14Frame = 0;
  let s15Frame = 0;
  let s16Frame = 0;
  let activeScene = "s2";
  let overlayShown = false;
  let scene3Unlocked = false;
  let scene3TitleTriggered = false;
  let pendingRailReverseClearScene = null;
  const sceneTitleShown = new Set();
  let lastScrollTop = 0;
  let railJumpTime = 0;
  const projectSceneState = {
    s4: { shown: false, unlocked: false },
    s7: { shown: false, unlocked: false },
    s9: { shown: false, unlocked: false },
    s11: { shown: false, unlocked: false },
    s14: { shown: false, unlocked: false },
  };
  const reverseThresholdUnlocked = new Set();
  let activeProjectPopoverScene = null;
  let dismissActiveProjectPopover = null;
  let activeProjectPopoverDirection = 0;
  let activeProjectPopoverHoldUntil = 0;
  let activeProjectPopoverShownAt = 0;
  let activeProjectPopoverShownScrollTop = 0;
  let activeThresholdTitleOwnerScene = null;
  if (typeof window !== "undefined" && window.__scene2ThresholdSeen) {
    sceneTitleShown.add("s2");
  }

  function maybeRunSceneTitle(sceneKey) {
    const content = thresholdSceneContent[sceneKey];
    if (!content || !thresholdController) return;
    reverseThresholdUnlocked.delete(sceneKey);
    activeThresholdTitleOwnerScene = sceneKey;
    if (typeof thresholdController.setActiveTitleOwner === "function") {
      thresholdController.setActiveTitleOwner(sceneKey);
    }
    if (sceneKey === "s2") {
      if (typeof thresholdController.runFlowTitle !== "function") return;
      sceneTitleShown.add(sceneKey);
      return thresholdController.runFlowTitle(content);
    }
    if (typeof thresholdController.runFlowTitle !== "function") return;
    sceneTitleShown.add(sceneKey);
    return thresholdController.runFlowTitle(content);
  }

  function maybeRunReverseThreshold(sceneKey, scrollDirection) {
    if (scrollDirection >= -1) return;
    reverseThresholdUnlocked.add(sceneKey);
    if (
      thresholdController &&
      typeof thresholdController.isDocked === "function" &&
      thresholdController.isDocked() &&
      typeof thresholdController.clearDockedTitle === "function"
    ) {
      thresholdController.clearDockedTitle();
    }
  }

  const locationThresholdSeams = [
    { sceneKey: "s2", start: s3Start },
    { sceneKey: "s6", start: s6Start },
    { sceneKey: "s8", start: s8Start },
    { sceneKey: "s10", start: s10Start },
    { sceneKey: "s13", start: s13Start },
    { sceneKey: "s15", start: s15Start },
  ];
  function thresholdStartForScene(sceneKey) {
    return locationThresholdSeams.find((seam) => seam.sceneKey === sceneKey)?.start ?? null;
  }
  const projectThresholdSeams = [
    { sceneKey: "s4", start: s4Start, end: s5Start },
    { sceneKey: "s7", start: s7Start, end: s8Start },
    { sceneKey: "s9", start: s9Start, end: s10Start },
    { sceneKey: "s11", start: s11Start, end: s12Start },
    { sceneKey: "s14", start: s14Start, end: s15Start },
  ];

  function maybeRunLocationThresholdAtSeam(scrollTop, previousScrollTop) {
    const inRailJumpImmunity = (performance.now() - railJumpTime) < 1500;
    if (scrollTop === previousScrollTop) return;

    if (scrollTop < previousScrollTop && pendingRailReverseClearScene) {
      const pendingSeam = locationThresholdSeams.find((seam) => seam.sceneKey === pendingRailReverseClearScene);
      if (pendingSeam) {
        const crossedBackward = previousScrollTop >= pendingSeam.start && scrollTop < pendingSeam.start;
        if (crossedBackward) {
          pendingRailReverseClearScene = null;
          reverseThresholdUnlocked.add(pendingSeam.sceneKey);
          if (
            thresholdController &&
            typeof thresholdController.isDocked === "function" &&
            thresholdController.isDocked() &&
            typeof thresholdController.clearDockedTitle === "function"
          ) {
            thresholdController.clearDockedTitle();
          }
        }
      }
    }

    if (inRailJumpImmunity) return;

    if (scrollTop > previousScrollTop) {
      let chosenSeam = null;
      for (const seam of locationThresholdSeams) {
        const crossedForward = previousScrollTop < seam.start && scrollTop >= seam.start;
        if (!crossedForward) continue;
        if (!chosenSeam || seam.start < chosenSeam.start) {
          chosenSeam = seam;
        }
      }
      if (!chosenSeam) return;
      if (sceneTitleShown.has(chosenSeam.sceneKey) && !reverseThresholdUnlocked.has(chosenSeam.sceneKey)) {
        return;
      }
      maybeRunSceneTitle(chosenSeam.sceneKey);
      return;
    }

    let chosenSeam = null;
    for (const seam of locationThresholdSeams) {
      const crossedBackward = previousScrollTop >= seam.start && scrollTop < seam.start;
      if (!crossedBackward) continue;
      if (!chosenSeam || seam.start > chosenSeam.start) {
        chosenSeam = seam;
      }
    }
    if (chosenSeam) {
      maybeRunReverseThreshold(chosenSeam.sceneKey, -2);
    }
  }

  function maybeClearOwnedThresholdTitle(scrollTop, previousScrollTop) {
    if (!activeThresholdTitleOwnerScene) return;
    const ownerStart = thresholdStartForScene(activeThresholdTitleOwnerScene);
    if (ownerStart == null) return;
    const crossedBackward = previousScrollTop >= ownerStart && scrollTop < ownerStart;
    if (!crossedBackward) return;
    activeThresholdTitleOwnerScene = null;
    if (
      thresholdController &&
      typeof thresholdController.hasActiveTitle === "function" &&
      thresholdController.hasActiveTitle() &&
      typeof thresholdController.clearActiveTitle === "function"
    ) {
      thresholdController.clearActiveTitle();
    }
  }

  function maybeDismissProjectPopoverOnLeave(scrollTop) {
    if (!activeProjectPopoverScene || typeof dismissActiveProjectPopover !== "function") return;
    const seam = projectThresholdSeams.find((entry) => entry.sceneKey === activeProjectPopoverScene);
    if (!seam) return;
    if (activeProjectPopoverDirection > 0 && scrollTop >= seam.end) {
      dismissActiveProjectPopover();
    }
  }

  function maybeDismissProjectPopoverOnDirection(scrollTop, scrollDirection, now) {
    if (!activeProjectPopoverScene || typeof dismissActiveProjectPopover !== "function") return;
    if (activeProjectPopoverDirection < 0) {
      if (scrollDirection > 1) {
        dismissActiveProjectPopover();
      }
      return;
    }
    if (now < activeProjectPopoverHoldUntil) return;
    if (activeProjectPopoverDirection > 0 && scrollDirection > 1) {
      dismissActiveProjectPopover();
    } else if (activeProjectPopoverDirection < 0 && scrollDirection < -1) {
      dismissActiveProjectPopover();
    }
  }

  function maybeRunProjectThresholdAtSeam(scrollTop, previousScrollTop) {
    const inRailJumpImmunity = (performance.now() - railJumpTime) < 1500;
    for (const seam of projectThresholdSeams) {
      const crossedForward = previousScrollTop < seam.start && scrollTop >= seam.start;
      const crossedBackward = previousScrollTop >= seam.start && scrollTop < seam.start;
      if (!crossedForward && !crossedBackward) continue;
      if (inRailJumpImmunity) continue;
      maybeShowProjectScene(seam.sceneKey, crossedForward ? 1 : -1);
    }
  }

  function warmFramesDuringProjectHold(sceneKey, holdDuration) {
    if (holdDuration <= 0) return;
    const warmMap = {
      s4: { getStream: ensureS6Stream, scene: "s6", warmCount: 120 },
      s7: { getStream: ensureS8Stream, scene: "s8", warmCount: 120 },
      s9: { getStream: ensureS10Stream, scene: "s10", warmCount: 120 },
      s11: { getStream: ensureS13Stream, scene: "s13", warmCount: 120 },
      s14: { getStream: ensureS15Stream, scene: "s15", warmCount: 160 },
    };
    const target = warmMap[sceneKey];
    if (!target) return;

    const startedAt = performance.now();
    const stream = target.getStream();
    const tick = () => {
      const now = performance.now();
      stream.preloadRange(0, target.warmCount);
      stream.setTarget(0, now);
      stream.processQueue(now, true);
      if (now - startedAt < holdDuration) {
        window.setTimeout(tick, 90);
      }
    };

    window.setTimeout(tick, 90);
  }

  function createProjectHoldReadiness(sceneKey) {
    const useTouchReadiness = viewportMode === "mobile" || viewportMode === "tablet";
    const readinessMap = {
      s4: { getStream: ensureS6Stream, touchReadyCount: 36, count: 120 },
      s7: { getStream: ensureS8Stream, touchReadyCount: 36, count: 120 },
      s9: { getStream: ensureS10Stream, touchReadyCount: 36, count: 120 },
      s11: { getStream: ensureS13Stream, touchReadyCount: 36, count: 120 },
      s14: { getStream: ensureS15Stream, touchReadyCount: 48, count: 160 },
    };
    const target = readinessMap[sceneKey];
    if (!target) return null;
    const stream = target.getStream();
    if (!stream) return null;
    if (useTouchReadiness && typeof stream.retainLoadedFrames === "function") {
      stream.retainLoadedFrames();
    }
    const readyCount = useTouchReadiness
      ? target.touchReadyCount
      : Math.min(target.count, Math.ceil(target.count * 0.88));

    return () => {
      const now = performance.now();
      stream.preloadRange(0, target.count);
      stream.setTarget(0, now);
      stream.processQueue(now, true);
      return stream.countLoadedInRange(0, useTouchReadiness ? readyCount : target.count) >= readyCount;
    };
  }

  function maybeShowProjectScene(sceneKey, direction = 1) {
    const state = projectSceneState[sceneKey];
    if (!state) return;
    const seam = projectThresholdSeams.find((entry) => entry.sceneKey === sceneKey);
    const firstTime = !state.shown;
    const isReverse = direction < 0;
    const holdDuration = isReverse ? 0 : 1500;
    const autoDismissAfter = isReverse ? 850 : 0;
    state.shown = true;
    state.unlocked = true;

    if (activeProjectPopoverScene === sceneKey) return;
    if (typeof dismissActiveProjectPopover === "function") {
      dismissActiveProjectPopover();
    }

    const preserveThresholdTitle =
      thresholdController &&
      typeof thresholdController.hasActiveTitle === "function" &&
      thresholdController.hasActiveTitle();

    if (!preserveThresholdTitle && thresholdController && typeof thresholdController.showVeil === "function") {
      thresholdController.showVeil(0.0, 0.0);
    }

    activeProjectPopoverScene = sceneKey;
    activeProjectPopoverDirection = direction;
    activeProjectPopoverHoldUntil = performance.now() + holdDuration;
    activeProjectPopoverShownAt = performance.now();
    activeProjectPopoverShownScrollTop = journey.scrollTop;
    if (!isReverse) {
      warmFramesDuringProjectHold(sceneKey, holdDuration);
    }
    showProjectPopover(sceneKey, () => {
      activeProjectPopoverScene = null;
      dismissActiveProjectPopover = null;
      activeProjectPopoverDirection = 0;
      activeProjectPopoverHoldUntil = 0;
      activeProjectPopoverShownAt = 0;
      activeProjectPopoverShownScrollTop = 0;
      journey.style.overflowY = "scroll";
      window.setTimeout(() => {
        const hasTitleNow =
          thresholdController &&
          typeof thresholdController.hasActiveTitle === "function" &&
          thresholdController.hasActiveTitle();
        if (!hasTitleNow && thresholdController && typeof thresholdController.hideVeil === "function") {
          thresholdController.hideVeil();
        }
      }, 220);
    }, {
      scrollDismiss: !isReverse,
      holdDuration,
      holdUntilReady: isReverse ? null : createProjectHoldReadiness(sceneKey),
      maxHoldDuration: isReverse || viewportMode === "desktop" ? (isReverse ? holdDuration : 5200) : Number.POSITIVE_INFINITY,
      autoDismissAfter: 0,
      entranceDelay: 0,
      entranceDuration: firstTime ? 360 : 280,
      entranceOpacityDuration: firstTime ? 280 : 220,
    });
    dismissActiveProjectPopover = window.__dismissProjectPopover || null;
    if (isReverse && typeof dismissActiveProjectPopover === "function") {
      const dismissReversePopover = dismissActiveProjectPopover;
      window.setTimeout(() => {
        if (dismissActiveProjectPopover === dismissReversePopover) {
          dismissReversePopover();
        }
      }, 4000);
    }
  }

  function frameForScrollRange(scrollPos, start, end, maxFrame) {
    if (scrollPos <= start) return 0;
    if (scrollPos >= end) return maxFrame;
    const range = end - start;
    if (range <= 0) return 0;
    const progress = (scrollPos - start) / range;
    return Math.floor(progress * maxFrame);
  }

  function syncFramesToScrollPosition(scrollPos) {
    s2Frame = frameForScrollRange(scrollPos, 0, s3Start, 120);
    s3Frame = frameForScrollRange(scrollPos, s3Start, s4Start, 288);
    s4Frame = frameForScrollRange(scrollPos, s4Start, s5Start, 120);
    s5Frame = frameForScrollRange(scrollPos, s5Start, s6Start, 240);
    s6Frame = frameForScrollRange(scrollPos, s6Start, s7Start, 240);
    s7Frame = frameForScrollRange(scrollPos, s7Start, s8Start, 120);
    s8Frame = frameForScrollRange(scrollPos, s8Start, s9Start, 240);
    s9Frame = frameForScrollRange(scrollPos, s9Start, s10Start, 240);
    s10Frame = frameForScrollRange(scrollPos, s10Start, s11Start, 240);
    s11Frame = frameForScrollRange(scrollPos, s11Start, s12Start, 240);
    s12Frame = frameForScrollRange(scrollPos, s12Start, s13Start, 240);
    s13Frame = frameForScrollRange(scrollPos, s13Start, s14Start, 240);
    s14Frame = frameForScrollRange(scrollPos, s14Start, s15Start, 168);
    s15Frame = frameForScrollRange(scrollPos, s15Start, s16Start, 288);
    s16Frame = frameForScrollRange(scrollPos, s16Start, s16Start + s16ScrollRange, 120);
  }

  function warmStreamAtFrame(stream, frame, now = performance.now()) {
    const targetFrame = Math.max(0, Math.round(frame));
    stream.prime(targetFrame);
    stream.setTarget(targetFrame, now);
  }

  function warmStreamOnApproach(scrollTop, start, getStream, now, distance = 800, frameCount = 30, retainFullRange = false) {
    if (scrollTop <= start - distance) return;
    const stream = getStream();
    if (!stream || stream._warmed) return;
    if (retainFullRange && typeof stream.retainLoadedFrames === "function") {
      stream.retainLoadedFrames();
    }
    stream.preloadRange(0, frameCount);
    stream.setTarget(0, now);
    stream._warmed = true;
  }

  function warmUpcomingScenes(scrollTop, now) {
    warmStreamOnApproach(scrollTop, s3Start, () => s3Stream, now);
    warmStreamOnApproach(scrollTop, s4Start, () => ensureS4Stream(), now);
    warmStreamOnApproach(scrollTop, s5Start, () => ensureS5Stream(), now);
    warmStreamOnApproach(scrollTop, s6Start, () => ensureS6Stream(), now);
    warmStreamOnApproach(scrollTop, s7Start, () => ensureS7Stream(), now);
    warmStreamOnApproach(scrollTop, s8Start, () => ensureS8Stream(), now);
    warmStreamOnApproach(scrollTop, s9Start, () => ensureS9Stream(), now);
    warmStreamOnApproach(scrollTop, s10Start, () => ensureS10Stream(), now);
    warmStreamOnApproach(scrollTop, s11Start, () => ensureS11Stream(), now);
    warmStreamOnApproach(scrollTop, s12Start, () => ensureS12Stream(), now);
    warmStreamOnApproach(scrollTop, s13Start, () => ensureS13Stream(), now);
    warmStreamOnApproach(scrollTop, s14Start, () => ensureS14Stream(), now);
    warmStreamOnApproach(scrollTop, s15Start, () => ensureS15Stream(), now, 4800, 289, true);
    warmStreamOnApproach(scrollTop, s16Start, () => ensureS16Stream(), now, 4200, 121, true);
  }

  function masterLoop(now) {
    const scrollTop = journey.scrollTop;
    const scrollDirection = scrollTop - lastScrollTop;

    warmUpcomingScenes(scrollTop, now);
    maybeClearOwnedThresholdTitle(scrollTop, lastScrollTop);
    maybeRunLocationThresholdAtSeam(scrollTop, lastScrollTop);
    maybeRunProjectThresholdAtSeam(scrollTop, lastScrollTop);
    maybeDismissProjectPopoverOnLeave(scrollTop);
    maybeDismissProjectPopoverOnDirection(scrollTop, scrollDirection, now);

    if (scrollTop <= s3Start) {
      if (activeScene !== "s2") {
        activeScene = "s2";
        s2Canvas.style.opacity = "1";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        overlayShown = false;
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const progress = Math.min(scrollTop / s2MaxScroll, 1);
      const targetFrame = Math.floor(progress * 120);
      s2Frame += (targetFrame - s2Frame) * 0.08;
      s2Stream.setTarget(Math.round(s2Frame), now);
      s2Stream.draw(Math.round(s2Frame));

    } else if (scrollTop < s4Start) {
      if (activeScene !== "s3") {
        activeScene = "s3";
        ensureS4Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "1";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }

      if (!scene3Unlocked) {
        if (!scene3TitleTriggered) {
          scene3TitleTriggered = true;
          s3Stream.prime(0);
          maybeRunSceneTitle("s2");
        }
        scene3Unlocked = true;
      }
      const scrolled = scrollTop - s3Start;
      const progress = Math.min(scrolled / s3ScrollRange, 1);
      const targetFrame = Math.floor(progress * 288);
      s3Frame += (targetFrame - s3Frame) * 0.08;
      s3Stream.setTarget(Math.round(s3Frame), now);
      s3Stream.draw(Math.round(s3Frame));
    } else if (scrollTop < s5Start) {
      if (activeScene !== "s4") {
        activeScene = "s4";
        ensureS4Stream().prime(0);
        ensureS6Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "1";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(Math.max(0, Math.round(s3Frame)));
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s4Start;
      const progress = Math.min(scrolled / s4ScrollRange, 1);
      const targetFrame = Math.floor(progress * 120);
      s4Frame += (targetFrame - s4Frame) * 0.08;
      s4Stream.setTarget(Math.round(s4Frame), now);
      s4Stream.draw(Math.round(s4Frame));
      updateScrollDebugOverlay({ scene: "s4", frame: s4Frame, stream: s4Stream, scrollTop });
    } else if (scrollTop < s6Start) {
      if (activeScene !== "s5") {
        activeScene = "s5";
        ensureS6Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "1";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(Math.max(0, Math.round(s4Frame)));
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s5Start;
      const progress = Math.min(scrolled / s5ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s5Frame += (targetFrame - s5Frame) * 0.08;
      s5Stream.setTarget(Math.round(s5Frame), now);
      s5Stream.draw(Math.round(s5Frame));
      updateScrollDebugOverlay({ scene: "s5", frame: s5Frame, stream: s5Stream, scrollTop });
    } else if (scrollTop < s7Start) {
      if (activeScene !== "s6") {
        activeScene = "s6";
        ensureS7Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "1";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(Math.max(0, Math.round(s5Frame)));
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s6Start;
      const progress = Math.min(scrolled / s6ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s6Frame += (targetFrame - s6Frame) * 0.08;
      s6Stream.setTarget(Math.round(s6Frame), now);
      s6Stream.draw(Math.round(s6Frame));
      updateScrollDebugOverlay({ scene: "s6", frame: s6Frame, stream: s6Stream, scrollTop });
    } else if (scrollTop < s8Start) {
      if (activeScene !== "s7") {
        activeScene = "s7";
        ensureS8Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "1";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(Math.max(0, Math.round(s6Frame)));
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s7Start;
      const progress = Math.min(scrolled / s7ScrollRange, 1);
      const targetFrame = Math.floor(progress * 120);
      s7Frame += (targetFrame - s7Frame) * 0.08;
      s7Stream.setTarget(Math.round(s7Frame), now);
      s7Stream.draw(Math.round(s7Frame));
    } else if (scrollTop < s9Start) {
      if (activeScene !== "s8") {
        activeScene = "s8";
        ensureS9Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "1";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(Math.max(0, Math.round(s7Frame)));
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s8Start;
      const progress = Math.min(scrolled / s8ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s8Frame += (targetFrame - s8Frame) * 0.08;
      s8Stream.setTarget(Math.round(s8Frame), now);
      s8Stream.draw(Math.round(s8Frame));
      updateScrollDebugOverlay({ scene: "s8", frame: s8Frame, stream: s8Stream, scrollTop });
    } else if (scrollTop < s10Start) {
      if (activeScene !== "s9") {
        activeScene = "s9";
        ensureS10Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "1";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(Math.max(0, Math.round(s8Frame)));
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s9Start;
      const progress = Math.min(scrolled / s9ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s9Frame += (targetFrame - s9Frame) * 0.08;
      s9Stream.setTarget(Math.round(s9Frame), now);
      s9Stream.draw(Math.round(s9Frame));
      updateScrollDebugOverlay({ scene: "s9", frame: s9Frame, stream: s9Stream, scrollTop });
    } else if (scrollTop < s11Start) {
      if (activeScene !== "s10") {
        activeScene = "s10";
        ensureS11Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "1";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(Math.max(0, Math.round(s9Frame)));
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s10Start;
      const progress = Math.min(scrolled / s10ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s10Frame += (targetFrame - s10Frame) * 0.08;
      s10Stream.setTarget(Math.round(s10Frame), now);
      s10Stream.draw(Math.round(s10Frame));
      updateScrollDebugOverlay({ scene: "s10", frame: s10Frame, stream: s10Stream, scrollTop });
    } else if (scrollTop < s12Start) {
      if (activeScene !== "s11") {
        activeScene = "s11";
        ensureS13Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "1";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(Math.max(0, Math.round(s10Frame)));
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s11Start;
      const progress = Math.min(scrolled / s11ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s11Frame += (targetFrame - s11Frame) * 0.08;
      s11Stream.setTarget(Math.round(s11Frame), now);
      s11Stream.draw(Math.round(s11Frame));
      updateScrollDebugOverlay({ scene: "s11", frame: s11Frame, stream: s11Stream, scrollTop });
    } else if (scrollTop < s13Start) {
      if (activeScene !== "s12") {
        activeScene = "s12";
        ensureS13Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "1";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(Math.max(0, Math.round(s11Frame)));
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s12Start;
      const progress = Math.min(scrolled / s12ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s12Frame += (targetFrame - s12Frame) * 0.08;
      s12Stream.setTarget(Math.round(s12Frame), now);
      s12Stream.draw(Math.round(s12Frame));
      updateScrollDebugOverlay({ scene: "s12", frame: s12Frame, stream: s12Stream, scrollTop });
    } else if (scrollTop < s14Start) {
      if (activeScene !== "s13") {
        activeScene = "s13";
        ensureS14Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "1";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(Math.max(0, Math.round(s12Frame)));
        s14Stream.clear(0);
        s15Stream.clear(0);
        s16Stream.clear(0);
      }
      const scrolled = scrollTop - s13Start;
      const progress = Math.min(scrolled / s13ScrollRange, 1);
      const targetFrame = Math.floor(progress * 240);
      s13Frame += (targetFrame - s13Frame) * 0.08;
      s13Stream.setTarget(Math.round(s13Frame), now);
      s13Stream.draw(Math.round(s13Frame));
      updateScrollDebugOverlay({ scene: "s13", frame: s13Frame, stream: s13Stream, scrollTop });
    } else if (scrollTop < s15Start) {
      if (activeScene !== "s14") {
        activeScene = "s14";
        ensureS15Stream().prime(0);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "1";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(Math.max(0, Math.round(s13Frame)));
      }
      const scrolled = scrollTop - s14Start;
      const progress = Math.min(scrolled / s14ScrollRange, 1);
      const targetFrame = Math.floor(progress * 168);
      s14Frame += (targetFrame - s14Frame) * 0.08;
      s14Stream.setTarget(Math.round(s14Frame), now);
      s14Stream.draw(Math.round(s14Frame));
    } else if (scrollTop < s16Start) {
      if (activeScene !== "s15") {
        activeScene = "s15";
        ensureS16Stream().preloadRange(0, 60);
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "1";
        s16Canvas.style.opacity = "0";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(Math.max(0, Math.round(s14Frame)));
      }
      const scrolled = scrollTop - s15Start;
      const progress = Math.min(scrolled / s15ScrollRange, 1);
      const targetFrame = Math.floor(progress * 288);
      s15Frame += (targetFrame - s15Frame) * 0.08;
      s15Stream.setTarget(Math.round(s15Frame), now);
      s15Stream.draw(Math.round(s15Frame));
    } else {
      if (activeScene !== "s16") {
        activeScene = "s16";
        s2Canvas.style.opacity = "0";
        s3Canvas.style.opacity = "0";
        s4Canvas.style.opacity = "0";
        s5Canvas.style.opacity = "0";
        s6Canvas.style.opacity = "0";
        s7Canvas.style.opacity = "0";
        s8Canvas.style.opacity = "0";
        s9Canvas.style.opacity = "0";
        s10Canvas.style.opacity = "0";
        s11Canvas.style.opacity = "0";
        s12Canvas.style.opacity = "0";
        s13Canvas.style.opacity = "0";
        s14Canvas.style.opacity = "0";
        s15Canvas.style.opacity = "0";
        s16Canvas.style.opacity = "1";
        s2Stream.clear(0);
        s3Stream.clear(0);
        s4Stream.clear(0);
        s5Stream.clear(0);
        s6Stream.clear(0);
        s7Stream.clear(0);
        s8Stream.clear(0);
        s9Stream.clear(0);
        s10Stream.clear(0);
        s11Stream.clear(0);
        s12Stream.clear(0);
        s13Stream.clear(0);
        s14Stream.clear(0);
        s15Stream.clear(Math.max(0, Math.round(s15Frame)));
      }
      const scrolled = scrollTop - s16Start;
      const progress = Math.min(scrolled / s16ScrollRange, 1);
      const targetFrame = Math.floor(progress * 120);
      s16Frame += (targetFrame - s16Frame) * 0.08;
      s16Stream.setTarget(Math.round(s16Frame), now);
      s16Stream.draw(Math.round(s16Frame));
    }

    syncJourneyChromeScene(activeScene);
    lastScrollTop = scrollTop;
  }

  const railTargetByProject = {
    kindling: { scrollPos: s3Start + 1, content: thresholdSceneContent.s2,  sceneKey: "s2",  ensureStream: null },
    thinktum: { scrollPos: s6Start + 1, content: thresholdSceneContent.s6,  sceneKey: "s6",  ensureStream: ensureS6Stream },
    lpc:      { scrollPos: s8Start + 1, content: thresholdSceneContent.s8,  sceneKey: "s8",  ensureStream: ensureS8Stream },
    reignite: { scrollPos: s10Start + 1, content: thresholdSceneContent.s10, sceneKey: "s10", ensureStream: ensureS10Stream },
    ecnw:     { scrollPos: s13Start + 1, content: thresholdSceneContent.s13, sceneKey: "s13", ensureStream: ensureS13Stream },
    contact:  { scrollPos: s15Start + 1, content: thresholdSceneContent.s15, sceneKey: "s15", ensureStream: ensureS15Stream },
  };

  journeyChromeGlyphs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const project = btn.dataset.project;
      const target = railTargetByProject[project];
      if (!target) return;

      if (typeof window.__dismissProjectPopover === "function") {
        window.__dismissProjectPopover();
      }

      if (target.ensureStream) {
        target.ensureStream().prime(0);
      }

      syncFramesToScrollPosition(target.scrollPos);
      switch (target.sceneKey) {
        case "s6":
          warmStreamAtFrame(ensureS5Stream(), s5Frame);
          warmStreamAtFrame(ensureS6Stream(), s6Frame);
          break;
        case "s8":
          warmStreamAtFrame(ensureS7Stream(), s7Frame);
          warmStreamAtFrame(ensureS8Stream(), s8Frame);
          break;
        case "s10":
          warmStreamAtFrame(ensureS9Stream(), s9Frame);
          warmStreamAtFrame(ensureS10Stream(), s10Frame);
          break;
        case "s13":
          warmStreamAtFrame(ensureS12Stream(), s12Frame);
          warmStreamAtFrame(ensureS13Stream(), s13Frame);
          break;
        case "s15":
          warmStreamAtFrame(ensureS14Stream(), s14Frame);
          warmStreamAtFrame(ensureS15Stream(), s15Frame);
          break;
      }

      if (thresholdController && typeof thresholdController.interrupt === "function") {
        thresholdController.interrupt();
      }
      thresholdTransition.style.transition = "none";
      thresholdTransition.style.opacity = "1";
      thresholdTransition.style.visibility = "visible";
      darkOverlay.style.opacity = "1";

      railJumpTime = performance.now();
      journey.scrollTop = target.scrollPos;
      lastScrollTop = target.scrollPos;
      pendingRailReverseClearScene = target.sceneKey;
      activeThresholdTitleOwnerScene = target.sceneKey;
      if (thresholdController && typeof thresholdController.setActiveTitleOwner === "function") {
        thresholdController.setActiveTitleOwner(target.sceneKey);
      }

      sceneTitleShown.add(target.sceneKey);
      reverseThresholdUnlocked.delete(target.sceneKey);

      if (!scene3Unlocked) {
        scene3Unlocked = true;
        overlayShown = true;
        scene3TitleTriggered = true;
      }

      requestAnimationFrame(() => {
        if (thresholdController && typeof thresholdController.runFlowTitle === "function") {
          thresholdController.runFlowTitle(target.content);
        }
      });
    });
  });

  s2Stream.draw(0);
  journeyFrameCallback = masterLoop;
  ensureVisualLoop();
}

/* ── World Overlay ───────────────────────────────────────── */

function buildOverlayGlyphField() {
  const chars = ["𑀓","𑀔","𑀕","𑀘","𑀚","𑀝","𑀞","𑀢","𑀣","𑀤","𑀥","𑀦","𑀧","𑀨","𑀫","𑀬","𑀭","𑀮","𑀯","𑀲"];
  const field = document.getElementById("overlayGlyphField");
  if (!field) return;
  field.innerHTML = "";
  const gap = 9;
  const padding = 34;
  const targetCell = 42;
  const cols = Math.max(10, Math.floor((window.innerWidth - padding * 2) / (targetCell + gap)));
  const rows = Math.max(8, Math.floor((window.innerHeight - padding * 2) / (targetCell + gap)));
  field.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  field.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  for (let i = 0; i < cols * rows; i++) {
    const glyph = document.createElement("span");
    glyph.textContent = chars[Math.floor(Math.random() * chars.length)];
    field.appendChild(glyph);
  }
}

function buildProjectPopoverGlyphField() {
  if (!projectPopoverGlyphField) return;
  projectPopoverGlyphField.innerHTML = "";
  const chars = ["𑀓","𑀔","𑀕","𑀘","𑀚","𑀝","𑀞","𑀢","𑀣","𑀤","𑀥","𑀦","𑀧","𑀨","𑀫","𑀬","𑀭","𑀮","𑀯","𑀲"];
  const cols = 11;
  const rows = 8;
  projectPopoverGlyphField.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  projectPopoverGlyphField.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  for (let i = 0; i < cols * rows; i += 1) {
    const glyph = document.createElement("span");
    glyph.textContent = chars[Math.floor(Math.random() * chars.length)];
    projectPopoverGlyphField.appendChild(glyph);
  }
}

function buildAboutOverlayGlyphField() {
  if (!aboutOverlayGlyphField) return;
  aboutOverlayGlyphField.innerHTML = "";
  const chars = ["𑀓","𑀔","𑀕","𑀘","𑀚","𑀝","𑀞","𑀢","𑀣","𑀤","𑀥","𑀦","𑀧","𑀨","𑀫","𑀬","𑀭","𑀮","𑀯","𑀲"];
  const cols = 18;
  const rows = 12;
  aboutOverlayGlyphField.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  aboutOverlayGlyphField.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  for (let i = 0; i < cols * rows; i += 1) {
    const glyph = document.createElement("span");
    glyph.textContent = chars[Math.floor(Math.random() * chars.length)];
    aboutOverlayGlyphField.appendChild(glyph);
  }
}

let overlayRippleController = null;

function initOverlayRipple() {
  if (overlayRippleController) {
    return overlayRippleController;
  }

  const canvas = document.getElementById("overlayRippleCanvas");
  if (!canvas) return null;
  const gl = canvas.getContext("webgl", { alpha: true });
  if (!gl) return null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  resize();
  window.addEventListener("resize", resize);

  const VS = `attribute vec2 aPos; varying vec2 vUv; void main() { vUv = vec2(aPos.x*0.5+0.5, aPos.y*0.5+0.5); gl_Position = vec4(aPos,0.,1.); }`;
  const FS = `precision highp float; uniform float uTime; varying vec2 vUv;
    void main() {
      float amp = 0.0012;
      float wx = sin(vUv.x * 18.0 + uTime * 1.1) * amp;
      float wy = sin(vUv.y * 14.0 + uTime * 0.85) * amp;
      vec2 d = vec2(wx, wy);
      float wave = sin((vUv.x + vUv.y + d.x + d.y) * 22.0 + uTime * 0.9) * 0.5 + 0.5;
      float shimmer = wave * 0.04;
      gl_FragColor = vec4(vec3(205./255., 175./255., 98./255.) * shimmer, shimmer * 0.35);
    }`;

  function mkShader(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, "uTime");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let running = false;

  function render(now) {
    if (!running) return;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  overlayRippleController = {
    start() {
      if (running) return;
      running = true;
      requestAnimationFrame(render);
    },
    stop() {
      running = false;
    },
  };

  return overlayRippleController;
}

function showWorldOverlay(onDismiss, options = {}) {
  const overlay = document.getElementById("worldOverlay");
  if (!overlay) return;
  const journey = options.scroller || document.getElementById("scrollJourney");
  const holdDuration = 1800;
  const holdUntilReady = typeof options.holdUntilReady === "function" ? options.holdUntilReady : null;
  const maxHoldDuration = options.maxHoldDuration ?? holdDuration;

  buildOverlayGlyphField();

  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.remove("is-visible", "is-exiting");
  void overlay.offsetWidth;
  overlay.classList.add("is-entering");

  window.setTimeout(() => {
    overlay.classList.remove("is-entering");
    overlay.classList.add("is-visible");
  }, 24);

  let dismissed = false;
  let scrollDismissEnabled = false;
  let guardedDismissOnScroll = null;
  let releaseTouchScrollHold = null;
  const blockScroll = (event) => {
    debugScrollHold("worldOverlay", event);
    event.preventDefault();
  };
  const blockKeyScroll = (event) => {
    const blockedKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (!blockedKeys.includes(event.key)) return;
    debugScrollHold("worldOverlay:key", event);
    event.preventDefault();
  };

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    if (releaseTouchScrollHold) {
      releaseTouchScrollHold();
      releaseTouchScrollHold = null;
    }
    if (journey) {
      journey.removeEventListener("wheel", blockScroll);
      journey.removeEventListener("touchmove", blockScroll);
      if (guardedDismissOnScroll) {
        journey.removeEventListener("scroll", guardedDismissOnScroll);
        journey.removeEventListener("wheel", guardedDismissOnScroll);
        journey.removeEventListener("touchmove", guardedDismissOnScroll);
      }
    }
    window.removeEventListener("wheel", blockScroll);
    window.removeEventListener("touchmove", blockScroll);
    window.removeEventListener("keydown", blockKeyScroll);
    if (guardedDismissOnScroll) {
      window.removeEventListener("wheel", guardedDismissOnScroll);
      window.removeEventListener("touchmove", guardedDismissOnScroll);
    }
    overlay.classList.remove("is-visible");
    overlay.classList.add("is-exiting");
    window.setTimeout(() => {
      overlay.classList.remove("is-exiting");
      overlay.setAttribute("aria-hidden", "true");
      if (onDismiss) onDismiss();
    }, 420);
  }

  guardedDismissOnScroll = () => {
    if (!scrollDismissEnabled) return;
    dismiss();
  };

  const startScrollHold = () => {
    if (dismissed) return;
    const startedAt = performance.now();
    const minimumHoldUntil = startedAt + holdDuration;
    const maxHoldUntil = startedAt + Math.max(holdDuration, maxHoldDuration);
    releaseTouchScrollHold = pushTouchScrollHold();
    if (journey) {
      journey.addEventListener("wheel", blockScroll, { passive: false });
      journey.addEventListener("touchmove", blockScroll, { passive: false });
    }
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeyScroll);
    const releaseWhenReady = () => {
      if (dismissed) return;
      const now = performance.now();
      const minimumElapsed = now >= minimumHoldUntil;
      const ready = !holdUntilReady || holdUntilReady();
      const timedOut = now >= maxHoldUntil;
      if ((!minimumElapsed || !ready) && !timedOut) {
        window.setTimeout(releaseWhenReady, 120);
        return;
      }
      if (releaseTouchScrollHold) {
        releaseTouchScrollHold();
        releaseTouchScrollHold = null;
      }
      scrollDismissEnabled = true;
      if (journey) {
        journey.removeEventListener("wheel", blockScroll);
        journey.removeEventListener("touchmove", blockScroll);
      }
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeyScroll);
    };
    window.setTimeout(releaseWhenReady, 120);
  };

  if (journey) {
    journey.addEventListener("scroll", guardedDismissOnScroll);
    journey.addEventListener("wheel", guardedDismissOnScroll);
    journey.addEventListener("touchmove", guardedDismissOnScroll);
  }
  window.addEventListener("wheel", guardedDismissOnScroll);
  window.addEventListener("touchmove", guardedDismissOnScroll);
  window.setTimeout(startScrollHold, 24);
}

function showProjectPopover(sceneKey, onDismiss, options = {}) {
  if (!projectPopover) return;
  const useMobileProjectPanel = isMobileProjectPanelMode();
  const scrollDismiss = options.scrollDismiss ?? false;
  const holdDuration = options.holdDuration ?? 0;
  const holdUntilReady = typeof options.holdUntilReady === "function" ? options.holdUntilReady : null;
  const maxHoldDuration = options.maxHoldDuration ?? holdDuration;
  const autoDismissAfter = options.autoDismissAfter ?? 0;
  const entranceDelay = options.entranceDelay ?? 24;
  const entranceDuration = options.entranceDuration ?? 700;
  const entranceOpacityDuration = options.entranceOpacityDuration ?? 500;
  const journey = document.getElementById("scrollJourney");

  setProjectPopoverContent(sceneKey);
  setProjectPopoverExpanded(!useMobileProjectPanel);
  buildProjectPopoverGlyphField();
  projectPopover.setAttribute("aria-hidden", "false");
  projectPopover.classList.remove("is-visible");
  projectPopover.style.transform = "";
  projectPopover.style.opacity = "";
  void projectPopover.offsetWidth;

  let dismissed = false;
  let autoDismissTimeoutId = 0;
  let scrollDismissEnabled = !scrollDismiss;
  let guardedDismissOnScroll = null;
  let guardedDismissOnPopoverTouch = null;
  let releaseTouchScrollHold = null;
  const toggleMobilePanel = (event) => {
    if (!useMobileProjectPanel) return;
    event.stopPropagation();
    playUiClick();
    setProjectPopoverExpanded(!projectPopoverExpanded);
  };
  const blockScroll = (event) => {
    debugScrollHold("projectPopover", event);
    event.preventDefault();
  };
  const blockKeyScroll = (event) => {
    const blockedKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
    if (!blockedKeys.includes(event.key)) return;
    debugScrollHold("projectPopover:key", event);
    event.preventDefault();
  };
  const stopPanelScrollDismiss = (event) => {
    if (!useMobileProjectPanel) return;
    event.stopPropagation();
  };
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    if (releaseTouchScrollHold) {
      releaseTouchScrollHold();
      releaseTouchScrollHold = null;
    }
    if (autoDismissTimeoutId) {
      window.clearTimeout(autoDismissTimeoutId);
      autoDismissTimeoutId = 0;
    }
    window.__dismissProjectPopover = null;
    if (journey) {
      journey.removeEventListener("wheel", blockScroll);
      journey.removeEventListener("touchmove", blockScroll);
      if (guardedDismissOnScroll) {
        journey.removeEventListener("scroll", guardedDismissOnScroll);
        journey.removeEventListener("wheel", guardedDismissOnScroll);
        journey.removeEventListener("touchmove", guardedDismissOnScroll);
      }
    }
    window.removeEventListener("wheel", blockScroll);
    window.removeEventListener("touchmove", blockScroll);
    window.removeEventListener("keydown", blockKeyScroll);
    projectPopover.removeEventListener("touchmove", blockScroll, true);
    if (guardedDismissOnPopoverTouch) {
      projectPopover.removeEventListener("touchmove", guardedDismissOnPopoverTouch, true);
    }
    if (guardedDismissOnScroll) {
      window.removeEventListener("wheel", guardedDismissOnScroll);
      window.removeEventListener("touchmove", guardedDismissOnScroll);
    }
    if (projectPopoverMobileToggle) {
      projectPopoverMobileToggle.removeEventListener("click", toggleMobilePanel);
    }
    if (projectPopoverBody) {
      projectPopoverBody.removeEventListener("wheel", stopPanelScrollDismiss);
      projectPopoverBody.removeEventListener("touchmove", stopPanelScrollDismiss);
    }
    projectPopover.classList.remove("is-visible");
    projectPopover.classList.remove("is-expanded");
    projectPopoverExpanded = false;
    window.setTimeout(() => {
      projectPopover.setAttribute("aria-hidden", "true");
      if (onDismiss) onDismiss();
    }, 420);
  };
  window.__dismissProjectPopover = dismiss;

  if (scrollDismiss) {
    const dismissOnScroll = () => dismiss();
    const startScrollHold = () => {
      if (dismissed) return;
      const startedAt = performance.now();
      const minimumHoldUntil = startedAt + holdDuration;
      const maxHoldUntil = startedAt + Math.max(holdDuration, maxHoldDuration);
      if (holdDuration <= 0 && !holdUntilReady) {
        window.setTimeout(() => {
          if (!dismissed) scrollDismissEnabled = true;
        }, 300);
        return;
      }
      releaseTouchScrollHold = pushTouchScrollHold();
      if (journey) {
        journey.addEventListener("wheel", blockScroll, { passive: false });
        journey.addEventListener("touchmove", blockScroll, { passive: false });
      }
      window.addEventListener("wheel", blockScroll, { passive: false });
      window.addEventListener("touchmove", blockScroll, { passive: false });
      window.addEventListener("keydown", blockKeyScroll);
      const releaseWhenReady = () => {
        if (dismissed) return;
        const now = performance.now();
        const minimumElapsed = now >= minimumHoldUntil;
        const ready = !holdUntilReady || holdUntilReady();
        const timedOut = now >= maxHoldUntil;
        if ((!minimumElapsed || !ready) && !timedOut) {
          window.setTimeout(releaseWhenReady, 120);
          return;
        }
        if (releaseTouchScrollHold) {
          releaseTouchScrollHold();
          releaseTouchScrollHold = null;
        }
        scrollDismissEnabled = true;
        if (journey) {
          journey.removeEventListener("wheel", blockScroll);
          journey.removeEventListener("touchmove", blockScroll);
        }
        window.removeEventListener("wheel", blockScroll);
        window.removeEventListener("touchmove", blockScroll);
        window.removeEventListener("keydown", blockKeyScroll);
      };
      window.setTimeout(releaseWhenReady, 120);
    };
    guardedDismissOnScroll = () => {
      if (!scrollDismissEnabled) return;
      if (journey) {
        journey.removeEventListener("scroll", guardedDismissOnScroll);
        journey.removeEventListener("wheel", guardedDismissOnScroll);
        journey.removeEventListener("touchmove", guardedDismissOnScroll);
      }
      window.removeEventListener("wheel", guardedDismissOnScroll);
      window.removeEventListener("touchmove", guardedDismissOnScroll);
      dismissOnScroll();
    };
    guardedDismissOnPopoverTouch = (event) => {
      if (!scrollDismissEnabled) return;
      if (useMobileProjectPanel && projectPopoverExpanded && projectPopoverBody?.contains(event.target)) {
        return;
      }
      guardedDismissOnScroll();
    };
    if (journey) {
      journey.addEventListener("scroll", guardedDismissOnScroll);
      journey.addEventListener("wheel", guardedDismissOnScroll);
      journey.addEventListener("touchmove", guardedDismissOnScroll);
    }
    projectPopover.addEventListener("touchmove", guardedDismissOnPopoverTouch, { capture: true });
    window.addEventListener("wheel", guardedDismissOnScroll);
    window.addEventListener("touchmove", guardedDismissOnScroll);
    window.setTimeout(startScrollHold, (entranceDelay || 16) + 24);
  }

  if (autoDismissAfter > 0) {
    autoDismissTimeoutId = window.setTimeout(() => {
      dismiss();
    }, autoDismissAfter);
  }

  window.setTimeout(() => {
    projectPopover.classList.add("is-visible");
  }, entranceDelay || 16);

  projectPopover.addEventListener(
    "click",
    (event) => {
      if (event.target === projectPopoverDismiss || projectPopoverDismiss?.contains(event.target)) {
        dismiss();
      }
    },
    { once: true }
  );

  if (projectPopoverDismiss) {
    projectPopoverDismiss.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
        playUiClick();
        dismiss();
      },
      { once: true }
    );
  }

  if (projectPopoverMobileToggle) {
    projectPopoverMobileToggle.addEventListener("click", toggleMobilePanel);
  }

  if (projectPopoverBody) {
    projectPopoverBody.addEventListener("wheel", stopPanelScrollDismiss);
    projectPopoverBody.addEventListener("touchmove", stopPanelScrollDismiss);
  }

  if (projectPopoverCta) {
    projectPopoverCta.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
        playUiClick();
        const shouldOpenCaseStudy = Boolean(caseStudySrcByScene[sceneKey]);
        const caseStudyHoldUntilReady = holdUntilReady;
        dismiss();
        if (shouldOpenCaseStudy) {
          window.setTimeout(() => {
            openCaseStudyOverlay(sceneKey, caseStudyHoldUntilReady);
          }, 520);
        }
      },
      { once: true }
    );
  }
}

if (caseStudyOverlayClose) {
  caseStudyOverlayClose.addEventListener("click", () => {
    closeCaseStudyOverlay();
  });
}

if (caseStudyOverlayBackdrop) {
  caseStudyOverlayBackdrop.addEventListener("click", () => {
    closeCaseStudyOverlay();
  });
}

if (aboutOverlayTrigger) {
  aboutOverlayTrigger.addEventListener("click", () => {
    openAboutOverlay();
  });
}

if (journeyMenuToggle) {
  journeyMenuToggle.addEventListener("click", () => {
    setJourneyMenuOpen(!journeyMenuOpen);
  });
}

if (journeyMenuAbout) {
  journeyMenuAbout.addEventListener("click", () => {
    if (viewportMode !== "mobile") {
      setJourneyMenuOpen(false);
    }
    openAboutOverlay();
  });
}

soundControls.forEach((control) => {
  control.addEventListener("click", () => {
    setSoundEnabled(!soundEnabled, true);
  });
});

motionControls.forEach((control) => {
  control.addEventListener("click", () => {
    setMotionEnabled(!motionEnabled, true);
  });
});

document.addEventListener("click", (event) => {
  const clickedControl = event.target?.closest?.("button, a, [role='button']");
  if (!clickedControl || soundControls.includes(clickedControl) || motionControls.includes(clickedControl)) return;
  if (soundEnabled && !soundUnlocked) {
    startSiteMusicFromGesture();
  }
  playUiClick();
});

if (aboutOverlayClose) {
  aboutOverlayClose.addEventListener("click", () => {
    closeAboutOverlay();
  });
}

if (aboutOverlayBackdrop) {
  aboutOverlayBackdrop.addEventListener("click", () => {
    closeAboutOverlay();
  });
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && journeyMenuOpen) {
    setJourneyMenuOpen(false);
    return;
  }
  if (event.key === "Escape" && caseStudyOverlay?.classList.contains("is-visible")) {
    closeCaseStudyOverlay();
  }
  if (event.key === "Escape" && aboutOverlayVisible) {
    closeAboutOverlay();
  }
});



updateViewportVars();
buildGlyphField();
buildAboutOverlayGlyphField();
startLoadingAnimation();

function initThresholdTransition() {
  if (!thresholdTransition || !mistCanvas || !darkOverlay || !thresholdMotif || !thresholdEntering || !thresholdBrahmi || !thresholdEnglish) {
    return null;
  }

  const gl = mistCanvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: false,
  });

  if (!gl) {
    thresholdTransition.style.display = "none";
    return null;
  }

  const mistDprCap = Math.min(window.devicePixelRatio || 1, 0.65);

  const VS = `attribute vec2 aPos; varying vec2 vUv;
void main() { vUv = vec2(aPos.x*0.5+0.5, aPos.y*0.5+0.5); gl_Position = vec4(aPos,0.,1.); }`;

  const FS = `precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAmt;
uniform vec2 uResolution;

mat2 rot(float a){ float s=sin(a),c=cos(a); return mat2(c,-s,s,c); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p=rot(0.37)*p*2.0+vec2(1.7,9.2); a*=0.5; }
  return v;
}
float swirl(vec2 uv, float t){
  vec2 q=vec2(fbm(uv+t*0.12), fbm(uv+vec2(5.2,1.3)-t*0.10));
  vec2 r=vec2(fbm(uv+4.0*q+vec2(1.7,9.2)+t*0.08), fbm(uv+4.0*q+vec2(8.3,2.8)-t*0.06));
  return fbm(uv+3.5*r);
}

void main(){
  vec2 uv = vUv;
  if (uResolution.y > uResolution.x) {
    uv.y = (uv.y - 0.5) * (uResolution.y / uResolution.x) + 0.5;
  }
  float t = uTime * 0.18;

  float warmSwirl  = swirl(uv * 2.0 + vec2(0.0, 0.0), t);
  float coolSwirl  = swirl(uv * 2.0 + vec2(8.3, 2.8), t * 0.85);

  vec3 warmA = vec3(0.804, 0.686, 0.384);
  vec3 warmB = vec3(0.545, 0.227, 0.059);
  vec3 warmCol = mix(warmA, warmB, warmSwirl);

  vec3 coolA = vec3(0.149, 0.212, 0.282);
  vec3 coolB = vec3(0.059, 0.082, 0.137);
  vec3 coolCol = mix(coolA, coolB, coolSwirl);

  float fullMask = smoothstep(0.15, 0.85, warmSwirl);
  float coolMask = smoothstep(0.15, 0.85, coolSwirl);
  float intensity = 0.65;

  vec3 base = vec3(0.035, 0.051, 0.086);
  vec3 color = base + (warmSwirl - 0.5) * 0.015;

  color = mix(color, warmCol, fullMask * uAmt * intensity);
  color = mix(color, coolCol, coolMask * uAmt * intensity * 0.85);

  float edge = abs(warmSwirl - 0.5) * 2.0;
  color += warmA * smoothstep(0.6, 1.0, edge) * uAmt * 0.10;

  float alpha = max(fullMask, coolMask * 0.85) * uAmt * 0.95;
  gl_FragColor = vec4(color, alpha);
}`;

  function mkShader(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uAmt = gl.getUniformLocation(prog, "uAmt");
  const uResolution = gl.getUniformLocation(prog, "uResolution");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function resize() {
    mistCanvas.width = Math.max(1, Math.floor(window.innerWidth * mistDprCap));
    mistCanvas.height = Math.max(1, Math.floor(window.innerHeight * mistDprCap));
    mistCanvas.style.width = `${window.innerWidth}px`;
    mistCanvas.style.height = `${window.innerHeight}px`;
    gl.viewport(0, 0, mistCanvas.width, mistCanvas.height);
    gl.useProgram(prog);
    gl.uniform2f(uResolution, mistCanvas.width, mistCanvas.height);
  }

  resize();
  window.addEventListener("resize", resize);

  let mistAmt = 0.68;
  let mistTarget = 0.68;
  const startTime = performance.now();
  let running = false;
  let dismissBound = false;
  let isScrolling = false;
  let scrollIdleTimer = 0;
  let dockArmed = false;
  let docked = false;
  let dockOriginScrollTop = 0;
  let dockDismissBound = false;
  let dockScrollHandler = null;
  let activeTitleOwner = null;
  const brahmiChars = ["𑀅","𑀆","𑀓","𑀢","𑀭","𑀫","𑀯","𑀲","𑀧","𑀤","𑁆","𑀁","𑀘","𑀝","𑀦","𑀔","𑀕"];

  const journey = document.getElementById("scrollJourney");
  if (journey) {
    journey.addEventListener("scroll", () => {
      isScrolling = true;
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        isScrolling = false;
      }, 150);
    });
  }

  function renderMist(now) {
    const thresholdOpacity = Number.parseFloat(window.getComputedStyle(thresholdTransition).opacity || "0");
    if (!thresholdTransition.classList.contains("is-active") || thresholdOpacity <= 0.01) {
      return;
    }
    if (isScrolling) return;
    mistAmt += (mistTarget - mistAmt) * 0.03;
    mistCanvas.style.opacity = "1";
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, (now - startTime) * 0.001);
    gl.uniform1f(uAmt, mistAmt);
    gl.uniform2f(uResolution, mistCanvas.width, mistCanvas.height);
    if (mistAmt < 0.02) return;
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  mistFrameCallback = renderMist;
  ensureVisualLoop();

  function delay(ms) { return new Promise((resolve) => window.setTimeout(resolve, ms)); }
  function animateMist(target, duration) { mistTarget = target; return delay(duration); }
  function animateOverlayTo(opacity, duration) {
    darkOverlay.style.transition = `opacity ${duration}ms ease`;
    darkOverlay.style.opacity = String(opacity);
  }

  function scrambleOut(el) {
    return new Promise((resolve) => {
      const len = [...el.textContent].length;
      let f = 0;
      const timer = window.setInterval(() => {
        el.textContent = Array.from({length: len}, () => brahmiChars[Math.floor(Math.random() * brahmiChars.length)]).join("");
        f += 1;
        if (f >= 12) {
          window.clearInterval(timer);
          el.style.opacity = "0";
          resolve();
        }
      }, 45);
    });
  }

  function bindDismissOnScroll() {
    if (dismissBound) return;
    dismissBound = true;
    const journey = document.getElementById("scrollJourney");
    const dismiss = () => {
      activeTitleOwner = null;
      thresholdMotif.style.transition = "opacity 0.6s ease";
      thresholdMotif.style.opacity = "0";
      thresholdEntering.style.transition = "opacity 0.6s ease";
      thresholdEntering.style.opacity = "0";
      thresholdEnglish.style.transition = "opacity 0.6s ease";
      thresholdEnglish.style.opacity = "0";
      thresholdTransition.classList.remove("is-active");
      thresholdTransition.setAttribute("aria-hidden", "true");
      if (fluidBgController && typeof fluidBgController.setSuppressed === "function") {
        fluidBgController.setSuppressed(false);
      }
      if (journey) {
        journey.removeEventListener("scroll", dismiss);
        journey.removeEventListener("wheel", dismiss);
        journey.removeEventListener("touchmove", dismiss);
      }
      window.removeEventListener("wheel", dismiss);
    };
    if (journey) {
      journey.addEventListener("scroll", dismiss, { once: true });
      journey.addEventListener("wheel", dismiss, { once: true });
      journey.addEventListener("touchmove", dismiss, { once: true });
    }
    window.addEventListener("wheel", dismiss, { once: true });
  }

  function clearDockState() {
    if (dockScrollHandler && journey) {
      journey.removeEventListener("scroll", dockScrollHandler);
      journey.removeEventListener("wheel", dockScrollHandler);
      journey.removeEventListener("touchmove", dockScrollHandler);
      window.removeEventListener("wheel", dockScrollHandler);
      window.removeEventListener("touchmove", dockScrollHandler);
      dockScrollHandler = null;
    }
    dockArmed = false;
    docked = false;
    dockOriginScrollTop = 0;
    dockDismissBound = false;
    thresholdTransition.classList.remove("is-dockable", "is-docked");
    mistCanvas.style.opacity = "1";
    darkOverlay.style.opacity = "1";
  }

  function dockTitle() {
    if (docked) return;
    docked = true;
    thresholdTransition.classList.add("is-docked");
    mistTarget = 0.0;
    if (fluidBgController && typeof fluidBgController.setSuppressed === "function") {
      fluidBgController.setSuppressed(false);
    }
  }

  function isDocked() {
    return docked;
  }

  function hasActiveTitle() {
    return Boolean(activeTitleOwner) && thresholdTransition.getAttribute("aria-hidden") !== "true";
  }

  function setActiveTitleOwner(sceneKey) {
    activeTitleOwner = sceneKey;
  }

  function clearDockedTitle() {
    if (!docked) return;
    activeTitleOwner = null;
    clearDockState();
    thresholdMotif.style.opacity = "0";
    thresholdEntering.style.opacity = "0";
    thresholdBrahmi.style.opacity = "0";
    thresholdEnglish.style.opacity = "0";
    thresholdTransition.classList.remove("is-active");
    thresholdTransition.setAttribute("aria-hidden", "true");
    mistTarget = 0.0;
    if (fluidBgController && typeof fluidBgController.setSuppressed === "function") {
      fluidBgController.setSuppressed(false);
    }
  }

  function clearActiveTitle() {
    activeTitleOwner = null;
    clearDockState();
    thresholdMotif.style.opacity = "0";
    thresholdEntering.style.opacity = "0";
    thresholdBrahmi.style.opacity = "0";
    thresholdEnglish.style.opacity = "0";
    thresholdTransition.classList.remove("is-active");
    thresholdTransition.setAttribute("aria-hidden", "true");
    mistTarget = 0.0;
    if (fluidBgController && typeof fluidBgController.setSuppressed === "function") {
      fluidBgController.setSuppressed(false);
    }
  }

  function bindDockOnScroll() {
    if (dockDismissBound || !journey) return;
    dockDismissBound = true;
    const maybeDock = () => {
      if (!dockArmed || docked) return;
      const scrolled = journey.scrollTop - dockOriginScrollTop;
      if (scrolled < 90) return;
      dockTitle();
      journey.removeEventListener("scroll", maybeDock);
      journey.removeEventListener("wheel", maybeDock);
      journey.removeEventListener("touchmove", maybeDock);
      window.removeEventListener("wheel", maybeDock);
      window.removeEventListener("touchmove", maybeDock);
      dockScrollHandler = null;
    };
    dockScrollHandler = maybeDock;
    journey.addEventListener("scroll", maybeDock);
    journey.addEventListener("wheel", maybeDock);
    journey.addEventListener("touchmove", maybeDock);
    window.addEventListener("wheel", maybeDock);
    window.addEventListener("touchmove", maybeDock);
  }

  function showVeil(initialAmt = 0.78, targetAmt = 0.88) {
    clearDockState();
    dismissBound = false;
    thresholdTransition.style.transition = "none";
    thresholdTransition.style.opacity = "1";
    thresholdTransition.style.visibility = "visible";
    thresholdTransition.classList.add("is-active");
    thresholdTransition.setAttribute("aria-hidden", "false");
    thresholdTransition.style.transition = "";
    thresholdTransition.style.opacity = "";
    thresholdTransition.style.visibility = "";
    darkOverlay.style.transition = "none";
    darkOverlay.style.opacity = "1";
    thresholdMotif.style.transition = "none";
    thresholdEntering.style.transition = "none";
    thresholdBrahmi.style.transition = "none";
    thresholdEnglish.style.transition = "none";
    thresholdMotif.style.opacity = "0";
    thresholdEntering.style.opacity = "0";
    thresholdBrahmi.style.opacity = "0";
    thresholdEnglish.style.opacity = "0";
    mistAmt = initialAmt;
    mistTarget = targetAmt;
  }

  function hideVeil() {
    activeTitleOwner = null;
    darkOverlay.style.opacity = "1";
    thresholdMotif.style.opacity = "0";
    thresholdEntering.style.opacity = "0";
    thresholdBrahmi.style.opacity = "0";
    thresholdEnglish.style.opacity = "0";
    mistTarget = 0.0;
    thresholdTransition.classList.remove("is-active");
    thresholdTransition.setAttribute("aria-hidden", "true");
  }

  async function run(onReadyForScroll, content = thresholdSceneContent.s2, options = {}) {
    if (running) return;
    running = true;
    clearDockState();
    dismissBound = false;
    const settleDelay = options.settleDelay ?? 2500;
    const settleMist = options.settleMist ?? 0.28;
    const overlayEndOpacity = options.overlayEndOpacity ?? 0.42;
    const revealDuration = options.revealDuration ?? 2500;
    const showMotif = options.showMotif ?? true;
    const showEntering = options.showEntering ?? true;
    const showBrahmi = options.showBrahmi ?? true;
    const showEnglish = options.showEnglish ?? true;
    const holdScroll = options.holdScroll ?? true;
    const releaseDelay = options.releaseDelay ?? 350;
    let scrollReleased = false;
    const blockScroll = (event) => {
      debugScrollHold(`threshold:${content?.project || content?.english || "unknown"}`, event);
      event.preventDefault();
    };
    const blockKeyScroll = (event) => {
      const blockedKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (!blockedKeys.includes(event.key)) return;
      debugScrollHold(`threshold:${content?.project || content?.english || "unknown"}:key`, event);
      event.preventDefault();
    };
    const releaseScroll = () => {
      if (scrollReleased) return;
      scrollReleased = true;
      if (!holdScroll) return;
      if (journey) {
        journey.removeEventListener("wheel", blockScroll);
        journey.removeEventListener("touchmove", blockScroll);
      }
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeyScroll);
    };
    if (fluidBgController && typeof fluidBgController.setSuppressed === "function") {
      fluidBgController.setSuppressed(true);
    }
    if (holdScroll) {
      if (journey) {
        journey.addEventListener("wheel", blockScroll, { passive: false });
        journey.addEventListener("touchmove", blockScroll, { passive: false });
      }
      window.addEventListener("wheel", blockScroll, { passive: false });
      window.addEventListener("touchmove", blockScroll, { passive: false });
      window.addEventListener("keydown", blockKeyScroll);
    }

    thresholdTransition.style.transition = "none";
    thresholdTransition.style.opacity = "1";
    thresholdTransition.style.visibility = "visible";
    thresholdTransition.classList.add("is-active");
    thresholdTransition.setAttribute("aria-hidden", "false");
    thresholdTransition.style.transition = "";
    thresholdTransition.style.opacity = "";
    thresholdTransition.style.visibility = "";
    darkOverlay.style.transition = "none";
    darkOverlay.style.opacity = "1";

    if (content?.rail) {
      showJourneyChrome(content.rail, !journeyChromeVisible);
    }

    thresholdEnglish.style.transition = "none";
    thresholdEnglish.style.opacity = "0";
    thresholdEnglish.textContent = content.english;
    thresholdBrahmi.style.transition = "none";
    thresholdBrahmi.style.opacity = "0";
    thresholdBrahmi.textContent = showBrahmi ? content.brahmi : "";
    thresholdMotif.style.transition = "none";
    thresholdMotif.style.opacity = "0";
    thresholdEntering.style.transition = "none";
    thresholdEntering.style.opacity = "0";
    thresholdEntering.textContent = content.project || "";
    mistAmt = 0.82;
    mistTarget = 0.92;

    window.setTimeout(() => {
      mistTarget = settleMist;
      animateOverlayTo(overlayEndOpacity, revealDuration);
    }, settleDelay);

    if (typeof onReadyForScroll === "function") {
      onReadyForScroll();
    }

    await delay(30);
    animateMist(0.95, 600);
    await delay(350);

    if (showMotif) {
      thresholdMotif.style.transition = "opacity 0.6s ease";
      thresholdMotif.style.opacity = "0.85";
      await delay(300);
    }

    if (showEntering) {
      thresholdEntering.style.transition = "opacity 0.5s ease";
      thresholdEntering.style.opacity = "1";
    }

    if (showBrahmi) {
      thresholdBrahmi.style.transition = "opacity 0.5s ease";
      thresholdBrahmi.style.opacity = "1";
      await delay(1000);
      await scrambleOut(thresholdBrahmi);
      await delay(250);
    } else {
      await delay(250);
    }

    if (showEnglish) {
      thresholdEnglish.style.transition = "opacity 0.7s ease";
      thresholdEnglish.style.opacity = "1";
      await delay(1000);
    }

    await delay(releaseDelay);
    releaseScroll();
    await delay(450);

    if (content?.rail) {
      dockArmed = true;
      dockOriginScrollTop = journey ? journey.scrollTop : 0;
      thresholdTransition.classList.add("is-dockable");
      bindDockOnScroll();
    } else {
      bindDismissOnScroll();
    }
    releaseScroll();
    running = false;
  }

  function runSceneTitle(content) {
    return run(null, content, {
      settleDelay: 3100,
      settleMist: 0.36,
      overlayEndOpacity: 0.42,
      revealDuration: 1600,
      holdScroll: true,
      releaseDelay: 300,
    });
  }

  function runFlowTitle(content) {
    return run(null, content, {
      settleDelay: 1350,
      settleMist: 0.28,
      overlayEndOpacity: 0.42,
      revealDuration: 1200,
      holdScroll: false,
      releaseDelay: 0,
    });
  }

  function runMinimalTitle(content) {
    return run(null, { english: content.english, brahmi: "", project: content.project, rail: content.rail }, {
      settleDelay: 1500,
      settleMist: 0.28,
      overlayEndOpacity: 0.42,
      revealDuration: 1500,
      showMotif: true,
      showEntering: true,
      showBrahmi: false,
      showEnglish: true,
      holdScroll: false,
    });
  }

  function interrupt() {
    running = false;
    activeTitleOwner = null;
    dismissBound = false;
    mistAmt = 0;
    mistTarget = 0;
    clearDockState();
    thresholdTransition.style.transition = "";
    thresholdTransition.style.opacity = "";
    thresholdTransition.style.visibility = "";
    thresholdTransition.classList.remove("is-active");
    thresholdTransition.setAttribute("aria-hidden", "true");
    thresholdMotif.style.transition = "none";
    thresholdEntering.style.transition = "none";
    thresholdBrahmi.style.transition = "none";
    thresholdEnglish.style.transition = "none";
    thresholdMotif.style.opacity = "0";
    thresholdEntering.style.opacity = "0";
    thresholdBrahmi.style.opacity = "0";
    thresholdEnglish.style.opacity = "0";
    darkOverlay.style.transition = "none";
    darkOverlay.style.opacity = "0";
    if (fluidBgController && typeof fluidBgController.setSuppressed === "function") {
      fluidBgController.setSuppressed(false);
    }
  }

  return { run, runSceneTitle, runFlowTitle, runMinimalTitle, showVeil, hideVeil, interrupt, isDocked, clearDockedTitle, clearActiveTitle, hasActiveTitle, setActiveTitleOwner };
}

function initFluidBackground() {
  if (!fluidBgCanvas) {
    return null;
  }

  const gl = fluidBgCanvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
  });

  if (!gl) {
    fluidBgCanvas.style.display = "none";
    return null;
  }

  const dprCap = Math.min(window.devicePixelRatio || 1, 1.35);
  const vertexShaderSource = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      v_uv = a_pos * 0.5 + 0.5;
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform float u_coolAmt;
    uniform vec2 u_resolution;

    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = rot(0.37) * p * 2.0 + vec2(1.7, 9.2);
        a *= 0.5;
      }
      return v;
    }

    float swirl(vec2 uv, float t) {
      vec2 q = vec2(
        fbm(uv + vec2(0.0, 0.0) + t * 0.12),
        fbm(uv + vec2(5.2, 1.3) - t * 0.1)
      );
      vec2 r = vec2(
        fbm(uv + 4.0 * q + vec2(1.7, 9.2) + t * 0.08),
        fbm(uv + 4.0 * q + vec2(8.3, 2.8) - t * 0.06)
      );
      return fbm(uv + 3.5 * r);
    }

    void main() {
      vec2 uv = v_uv;
      if (u_resolution.y > u_resolution.x) {
        uv.y = (uv.y - 0.5) * (u_resolution.y / u_resolution.x) + 0.5;
      }
      float t = u_time * 0.18;

      float idleSwirl = swirl(uv * 2.0, t * 0.5);
      float idleAmt = 0.07;

      float activeSwirl = swirl(uv * 2.5 + vec2(t * 0.15), t);
      float activeSwirl2 = swirl(uv * 1.8 - vec2(t * 0.1, t * 0.08), t * 0.7);

      vec3 base = vec3(0.18, 0.28, 0.42);
      vec3 color = base + (idleSwirl - 0.5) * 0.055;

      vec3 coolA = vec3(0.72, 0.88, 1.0);
      vec3 coolB = vec3(0.52, 0.74, 0.96);
      vec3 coolC = vec3(0.84, 0.94, 1.0);
      vec3 coolCol = mix(coolA, coolB, activeSwirl);
      coolCol = mix(coolCol, coolC, activeSwirl2 * 0.5);

      float fullMask = smoothstep(0.15, 0.85, activeSwirl);
      float shadowMask = smoothstep(0.05, 0.95, activeSwirl2);
      vec3 shadowCol = vec3(0.035, 0.055, 0.09);
      color = mix(color, shadowCol, shadowMask * (0.08 + u_coolAmt * 0.16));

      float intensity = 0.84;
      color = mix(color, coolCol, fullMask * (0.28 + u_coolAmt * 0.66) * intensity);

      float edge = abs(activeSwirl - 0.5) * 2.0;
      vec3 edgeTint = vec3(0.62, 0.72, 0.82);
      float edgeGlow = smoothstep(0.68, 1.0, edge) * (0.18 + u_coolAmt * 0.42) * 0.11;
      color += edgeTint * edgeGlow;

      float alpha = 0.92 + u_coolAmt * 0.35 + fullMask * 0.35;
      gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]),
    gl.STATIC_DRAW
  );

  const aPosition = gl.getAttribLocation(program, "a_position");
  const fallbackPosition = gl.getAttribLocation(program, "a_pos");
  const positionLocation = aPosition === -1 ? fallbackPosition : aPosition;
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, "u_time");
  const uCoolAmt = gl.getUniformLocation(program, "u_coolAmt");
  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const idleCoolAmount = 1.0;
  let coolAmount = idleCoolAmount;
  let targetCoolAmount = idleCoolAmount;
  let suppression = 0;
  let suppressionTarget = 0;

  function resize() {
    const width = Math.max(1, Math.floor(window.innerWidth * dprCap));
    const height = Math.max(1, Math.floor(window.innerHeight * dprCap));
    fluidBgCanvas.width = width;
    fluidBgCanvas.height = height;
    fluidBgCanvas.style.width = `${window.innerWidth}px`;
    fluidBgCanvas.style.height = `${window.innerHeight}px`;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uResolution, width, height);
  }

  resize();
  window.addEventListener("resize", resize);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let frameId = 0;

  function render(now) {
    if (document.visibilityState === "hidden") {
      frameId = window.requestAnimationFrame(render);
      return;
    }
    const fluidOpacity = Number.parseFloat(window.getComputedStyle(fluidBgCanvas).opacity || "0");
    suppression += (suppressionTarget - suppression) * 0.1;
    coolAmount += (targetCoolAmount - coolAmount) * 0.06;
    if (fluidOpacity <= 0.01 || suppression > 0.99) {
      frameId = window.requestAnimationFrame(render);
      return;
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, now * 0.001);
    gl.uniform1f(uCoolAmt, coolAmount * (1 - suppression));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    frameId = window.requestAnimationFrame(render);
  }

  frameId = window.requestAnimationFrame(render);

  return {
    destroy() {
      window.cancelAnimationFrame(frameId);
    },
    setSuppressed(value) {
      suppressionTarget = value ? 1 : 0;
    },
  };
}

thresholdController = initThresholdTransition();
fluidBgController = initFluidBackground();
resizeIntroCanvas();
const initialIntroStream = ensureIntroStream();
if (initialIntroStream) {
  initialIntroStream.prime(0);
}
