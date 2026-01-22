import { Pane } from "https://esm.sh/tweakpane@4.0.3";

const state = {
  fps: 30,
  bgOpacity: 0.08,
  color: "#20ff90",         // neon yeşil (senin temaya uyumlu)
  charset: "01⌁⟡⟠",
  size: 18
};

// GUI (istersen CSS ile gizleyebilirsin)
const gui = new Pane({ title: "Skills Matrix" });
const fpsCtrl = gui.addBinding(state, "fps", { min: 1, max: 120, step: 1 });
gui.addBinding(state, "bgOpacity", { min: 0, max: 0.25, step: 0.01 });
gui.addBinding(state, "color");
gui.addBinding(state, "charset");
const sizeCtrl = gui.addBinding(state, "size", { min: 10, max: 42, step: 1 });

const canvas = document.getElementById("canvas");
if (!canvas) throw new Error("Canvas #canvas not found");
const ctx = canvas.getContext("2d");

let w = 0, h = 0, colYPos = [];

const random = (items) => items[Math.floor(Math.random() * items.length)];
const randomRange = (start, end) => start + (end - start) * Math.random();

/**
 * Resize canvas to match ONLY the skills section size (not full screen).
 * Also handles HiDPI screens.
 */
const resize = () => {
  const parent = canvas.parentElement; // #skills
  const rect = parent.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) return;

  w = Math.floor(rect.width);
  h = Math.floor(rect.height);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const numCols = Math.ceil(w / state.size);
  colYPos = Array(numCols).fill(0);

  // initial clear
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, w, h);
};

window.addEventListener("resize", resize);
sizeCtrl.on("change", (ev) => { if (ev.last) resize(); });

// init
resize();

const draw = () => {
  // trail
  ctx.fillStyle = `rgba(0,0,0,${state.bgOpacity})`;
  ctx.fillRect(0, 0, w, h);

  // text
  ctx.fillStyle = state.color;
  ctx.font = `${state.size}px monospace`;

  for (let i = 0; i < colYPos.length; i++) {
    const yPos = colYPos[i];
    const xPos = i * state.size;

    ctx.fillText(random(state.charset), xPos, yPos);

    const reachedBottom = yPos >= h;
    const randomReset = yPos >= randomRange(200, 4200);

    colYPos[i] = (reachedBottom || randomReset) ? 0 : (yPos + state.size);
  }
};

// FPS controlled interval
let intervalId = setInterval(draw, 1000 / state.fps);

fpsCtrl.on("change", (ev) => {
  if (!ev.last) return;
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(draw, 1000 / ev.value);
});

// GitHub Pages bazen ilk yüklemede rect 0 döndürebilir → 1 kez daha dene
setTimeout(resize, 200);
