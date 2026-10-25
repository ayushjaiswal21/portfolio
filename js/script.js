// Scroll progress bar
const scrollProgress = document.getElementById("scrollProgress");
function updateScrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
  scrollProgress.style.width = `${pct}%`;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

// Mobile nav toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach((link) =>
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
  })
);

// Scroll-spy: highlight the nav link for the section in view
const sections = document.querySelectorAll("section, header.hero");
const navAnchors = document.querySelectorAll(".nav-links a");

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      navAnchors.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

sections.forEach((s) => spy.observe(s));

// Waveform — the hero's one deliberate animated element, representing a
// live voice-agent signal. Freezes to a single static frame under
// prefers-reduced-motion instead of looping forever — unless the visitor
// opts into the real mic demo below, which is motion answering their own
// action rather than ambient decoration, so it's allowed to run either way.
const canvas = document.getElementById("waveform");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let bars = [];
const BAR_COUNT = 48;
let micActive = false;
let micData = null;
let analyser = null;
let audioCtx = null;
let micStream = null;
let animating = false;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
}

function seedBars() {
  bars = Array.from({ length: BAR_COUNT }, () => ({
    target: 0.15 + Math.random() * 0.85,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawFrame(t) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const gap = w / BAR_COUNT;
  const barWidth = gap * 0.55;

  if (micActive && analyser && micData) {
    analyser.getByteFrequencyData(micData);
  }

  bars.forEach((bar, i) => {
    let amp;
    if (micActive && micData) {
      const bin = micData[Math.floor((i / BAR_COUNT) * micData.length)] / 255;
      amp = Math.max(0.06, bin);
    } else {
      const wobble = reduceMotion ? 0 : Math.sin(t / 650 + bar.phase) * 0.18;
      amp = Math.max(0.08, Math.min(1, bar.target + wobble));
    }
    const barHeight = amp * h * 0.78;
    const x = i * gap + (gap - barWidth) / 2;
    const y = (h - barHeight) / 2;

    const mid = BAR_COUNT / 2;
    const distFromMid = Math.abs(i - mid) / mid;
    ctx.fillStyle = distFromMid < 0.35 ? "#e8b339" : "rgba(73, 198, 216, 0.75)";
    ctx.fillRect(x, y, barWidth, barHeight);
  });
}

function loop(t) {
  drawFrame(t);
  if (micActive || !reduceMotion) {
    requestAnimationFrame(loop);
  } else {
    animating = false;
  }
}

function ensureLoopRunning() {
  if (!animating) {
    animating = true;
    requestAnimationFrame(loop);
  }
}

function startWaveform() {
  resizeCanvas();
  seedBars();
  drawFrame(0);
  if (!reduceMotion) {
    ensureLoopRunning();
    // Re-roll targets every couple seconds so the shape actually changes,
    // not just wobbles in place.
    setInterval(() => {
      if (!micActive) seedBars();
    }, 2200);
  }
}

// Resizing the backing buffer clears it; redraw immediately so a static
// (reduced-motion) frame doesn't go blank after a viewport change.
window.addEventListener("resize", () => {
  resizeCanvas();
  drawFrame(0);
});

// Live mic demo — opt-in. Nothing is recorded or sent anywhere; the
// stream only ever feeds a local AnalyserNode for the bar heights.
const micToggle = document.getElementById("micToggle");
const waveformDot = document.getElementById("waveformDot");
const waveformLabel = document.getElementById("waveformLabel");

async function enableMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(micStream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    micData = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);

    micActive = true;
    micToggle.classList.add("on");
    micToggle.setAttribute("aria-pressed", "true");
    micToggle.innerHTML = '<span class="mic-dot"></span> Listening — click to stop';
    waveformDot.classList.add("live");
    waveformLabel.textContent = "live mic input";
    ensureLoopRunning();
  } catch (err) {
    waveformLabel.textContent = "mic unavailable — showing demo signal";
    setTimeout(() => {
      waveformLabel.textContent = "voice agent / waveform";
    }, 2500);
  }
}

function disableMic() {
  micActive = false;
  if (micStream) micStream.getTracks().forEach((track) => track.stop());
  if (audioCtx) audioCtx.close();
  analyser = null;
  micData = null;
  micToggle.classList.remove("on");
  micToggle.setAttribute("aria-pressed", "false");
  micToggle.innerHTML = '<span class="mic-dot"></span> Try live voice';
  waveformLabel.textContent = "voice agent / waveform";
  seedBars();
  if (!reduceMotion) ensureLoopRunning();
  else drawFrame(0);
}

if (micToggle) {
  micToggle.addEventListener("click", () => {
    if (micActive) disableMic();
    else enableMic();
  });
}
startWaveform();

// Hero visual — a light Apple-style pointer tilt. Settles back with the
// same decelerate easing as the CSS transition; off entirely for touch
// and reduced-motion, where it has nothing to respond to.
const heroVisual = document.querySelector(".hero-visual");
if (heroVisual && !reduceMotion && matchMedia("(hover: hover)").matches) {
  heroVisual.addEventListener("mousemove", (e) => {
    const rect = heroVisual.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    heroVisual.style.transform =
      `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
  });
  heroVisual.addEventListener("mouseleave", () => {
    heroVisual.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  });
}

// Cursor-reactive glow in the hero — off for touch/reduced-motion, same
// as the tilt, since both need a pointer to react to.
const heroGlow = document.getElementById("heroGlow");
if (heroGlow && !reduceMotion && matchMedia("(hover: hover)").matches) {
  const heroEl = document.querySelector(".hero");
  heroEl.addEventListener("mouseenter", () => heroGlow.classList.add("active"));
  heroEl.addEventListener("mouseleave", () => heroGlow.classList.remove("active"));
  heroEl.addEventListener("mousemove", (e) => {
    const rect = heroEl.getBoundingClientRect();
    heroGlow.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    heroGlow.style.setProperty("--my", `${e.clientY - rect.top}px`);
  });
}

// Count-up — hero metrics animate from 0 to their resume figure once,
// the moment they first come into view.
const countEls = document.querySelectorAll("[data-count-to]");
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countObserver.unobserve(el);
      const target = parseFloat(el.dataset.countTo);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) {
        el.textContent = `${target.toFixed(decimals)}${suffix}`;
        return;
      }
      const duration = 1200;
      const start = performance.now();
      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.6 }
);
countEls.forEach((el) => countObserver.observe(el));

// Scroll reveal — one quiet entrance per section as it first comes into
// view, not a fade-up on every card. Hero already has its own load-in.
const revealTargets = document.querySelectorAll("section > .container > *");
const reveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        reveal.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);

if (!reduceMotion) {
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    reveal.observe(el);
  });
}
