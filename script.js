import { clickHandler, addEventListeners } from "./playNotes.js";

const getNoteName = (index, octaveNumber, sharp = "") =>
  (((index + 2) % 7) + 10).toString(36).toUpperCase() + sharp + octaveNumber;

function* createOctaveKeys(octaveNumber) {
  for (let i = 0; i < 7; i++) {
    const button = document.createElement("button");
    button.textContent = getNoteName(i, octaveNumber);
    button.addEventListener("click", clickHandler, { passive: true });
    button.autofocus = button.textContent === "C4";
    yield button;
    if (i !== 2 && i !== 6) {
      const button = document.createElement("button");
      button.addEventListener("click", clickHandler, { passive: true });
      button.textContent = getNoteName(i, octaveNumber, "#");
      button.className = "sharp";
      yield button;
    }
  }
}

const piano = document.createElement("main");
piano.id = "piano";
addEventListeners(piano);
for (let octavePitch = 1; octavePitch < 8; octavePitch++) {
  piano.append(...createOctaveKeys(octavePitch));
}

document.body.append(piano);
if (typeof Element.prototype.scrollIntoView === "function") {
  requestAnimationFrame(() =>
    document.querySelector("[autofocus]").scrollIntoView({
      behavior: "auto",
      block: "center",
      inline: "center",
    })
  );
}
