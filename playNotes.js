const playingNotes = new WeakSet();

function handlePointerMovements(e) {
  if (!playingNotes.has(e.target)) {
    playingNotes.add(e.target);
    getSynth()
      .then(synth => {
        synth.triggerAttack(this.textContent);
        e.target.focus();
        e.target.addEventListener(
          "pointerout",
          () => {
            synth.triggerRelease(this.textContent);
            playingNotes.delete(e.target);
          },
          {
            passive: true,
            once: true,
          }
        );
      })
      .catch(console.error);
  }
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
  const PASSIVE = { passive: true };
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
  }

  piano.addEventListener("pointerdown", monitorPointerMovements, PASSIVE);
}
