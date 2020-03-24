const PASSIVE = { passive: true };
const playingNotes = new Set();

const triggerReleaseCache = new WeakMap();
function triggerRelease() {
  this.removeEventListener("pointerout", triggerReleaseCache.get(this));
  getSynth().then(synth => synth.triggerRelease(this.textContent));
  playingNotes.delete(this);
}

function triggerAttack() {
  if (!playingNotes.has(this)) {
    playingNotes.add(this);
    getSynth()
      .then(synth => {
        synth.triggerAttack(this.textContent);
        this.focus();
        this.addEventListener(
          "pointerout",
          triggerReleaseCache.get(this),
          PASSIVE
        );
      })
      .catch(console.error);
    if (!triggerReleaseCache.has(this)) {
      triggerReleaseCache.set(this, triggerRelease.bind(this));
    }
  }
}

function handlePointerMovements(e) {
  triggerAttack.call(e.target);
}

let synth;
const getSynth = () => {
  if (synth == null) {
    synth = import("https://dev.jspm.io/tone@14").then(async Tone => {
      await Tone.default.start();
      return new Tone.default.PolySynth().toDestination();
    });
  }
  return synth;
};

export function clickHandler() {
  if (!playingNotes.has(this)) {
    playingNotes.add(this);
    getSynth()
      .then(synth => synth.triggerAttackRelease(this.textContent, "8n"))
      .then(() => playingNotes.delete(this))
      .catch(console.error);
  }
}

export function addEventListeners(piano) {
  function monitorPointerMovements() {
    piano.addEventListener("pointermove", handlePointerMovements, PASSIVE);
    piano.addEventListener(
      "pointerleave",
      deactivatePointerMonitoring,
      PASSIVE
    );
    piano.addEventListener("pointerup", deactivatePointerMonitoring, PASSIVE);
    piano.addEventListener(
      "pointercancel",
      deactivatePointerMonitoring,
      PASSIVE
    );
  }

  function deactivatePointerMonitoring(e) {
    piano.removeEventListener("pointermove", handlePointerMovements);
    piano.removeEventListener("pointerleave", deactivatePointerMonitoring);
    piano.removeEventListener("pointerup", deactivatePointerMonitoring);
    piano.removeEventListener("pointercancel", deactivatePointerMonitoring);
    playingNotes.forEach(Function.prototype.call.bind(triggerRelease));
  }

  piano.addEventListener("pointerdown", monitorPointerMovements, PASSIVE);
}
