import { addEventListeners } from "./playNotes.js";

const getNoteName = (index, octaveNumber, sharp = "") =>
  (((index + 2) % 7) + 10).toString(36).toUpperCase() + sharp + octaveNumber;

function* createOctaveKeys(octaveNumber) {
  for (let i = 0; i < 7; i++) {
    const button = document.createElement("button");
    button.textContent = getNoteName(i, octaveNumber);
    button.autofocus = button.textContent === "C4";
    yield button;
    if (i !== 2 && i !== 6) {
      const button = document.createElement("button");
      button.textContent = getNoteName(i, octaveNumber, "#");
      button.className = "sharp";
      yield button;
    }
  }
}

const piano = document.createElement("main");
piano.id = "piano";
piano.tabIndex = "0";
addEventListeners(piano);
for (let octavePitch = 1; octavePitch < 8; octavePitch++) {
  piano.append(...createOctaveKeys(octavePitch));
}

const pianoMinimap = document.createElement("input");
pianoMinimap.accessKey = "s";
pianoMinimap.setAttribute(
  "aria-label",
  "Choose which part of the piano you want visible."
);
pianoMinimap.type = "range";
pianoMinimap.min = 0;
function updateMinimapRange() {
  const { value, max } = pianoMinimap;
  const { offsetWidth, scrollLeft, scrollWidth } = piano;
  if (max !== scrollWidth - offsetWidth) {
    pianoMinimap.max = scrollWidth - offsetWidth;
    pianoMinimap.value = ((value / max) * pianoMinimap.max) | 0;
    pianoMinimap.style.setProperty(
      "--visible-ratio",
      (offsetWidth / scrollWidth) * 100 + "%"
    );
    pianoMinimap.value =
      ((scrollLeft + offsetWidth / 2) / scrollWidth) * pianoMinimap.max;
  }
}
pianoMinimap.addEventListener(
  "input",
  () => {
    piano.scrollLeft = Number(pianoMinimap.value) | 0;
  },
  { passive: true }
);
pianoMinimap.addEventListener("keydown", event => {
  if (event.code.startsWith("Arrow")) {
    const { value, max } = pianoMinimap;
    const { offsetWidth, scrollWidth } = piano;
    pianoMinimap.step = Math.min(
      (event.code === "ArrowUp" || event.code === "ArrowRight"
        ? max - value
        : value) || 1,
      pianoMinimap.max * (offsetWidth / scrollWidth)
    );
  }
});
pianoMinimap.addEventListener(
  "wheel",
  e => {
    pianoMinimap.value = Number(pianoMinimap.value) + e.deltaY;
    piano.scrollLeft = Number(pianoMinimap.value) | 0;
  },
  { passive: true }
);
pianoMinimap.addEventListener("keyup", () => {
  pianoMinimap.step = 1;
});
addEventListener("resize", updateMinimapRange, { passive: true });
requestAnimationFrame(() => requestAnimationFrame(updateMinimapRange));

document.body.append(piano, pianoMinimap);
if (typeof Element.prototype.scrollIntoView === "function") {
  requestAnimationFrame(() =>
    document.querySelector("[autofocus]").scrollIntoView({
      behavior: "auto",
      block: "center",
      inline: "center",
    })
  );
}
