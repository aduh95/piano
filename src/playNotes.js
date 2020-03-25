import { PolySynth, start } from "tone";

const PASSIVE = { passive: true };
const playingNotes = new Set();

function triggerRelease() {
  getSynth().then(synth => synth.triggerRelease(this.textContent));
  this.removeEventListener("pointerout", triggerRelease);

  // delaying the deletion to cancel pending click event
  requestAnimationFrame(() => playingNotes.delete(this));
}

function triggerAttack() {
  if (!playingNotes.has(this)) {
    playingNotes.add(this);
    getSynth()
      .then(synth => {
        synth.triggerAttack(this.textContent);
        this.focus();
        this.addEventListener("pointerout", triggerRelease, PASSIVE);
      })
      .catch(console.error);
  }
}

function handlePointerMovements(e) {
  triggerAttack.call(e.target);
}

let synth;
const getSynth = () => {
  if (synth == null) {
    synth = start().then(() => new PolySynth().toDestination());
  }
  return synth;
};

function clickHandler(e) {
  if (!playingNotes.has(e.target)) {
    playingNotes.add(e.target);
    getSynth()
      .then(synth => synth.triggerAttackRelease(e.target.textContent, "8n"))
      .then(() => playingNotes.delete(e.target))
      .catch(console.error);
  }
}

export function addEventListeners(piano) {
  function monitorPointerMovements(e) {
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

    handlePointerMovements(e);
  }

  function deactivatePointerMonitoring(e) {
    piano.removeEventListener("pointermove", handlePointerMovements);
    piano.removeEventListener("pointerleave", deactivatePointerMonitoring);
    piano.removeEventListener("pointerup", deactivatePointerMonitoring);
    piano.removeEventListener("pointercancel", deactivatePointerMonitoring);
    playingNotes.forEach(Function.prototype.call.bind(triggerRelease));
  }

  piano.addEventListener("pointerdown", monitorPointerMovements, PASSIVE);
  piano.addEventListener("click", clickHandler, PASSIVE);
}
