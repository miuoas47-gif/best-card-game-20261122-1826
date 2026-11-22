// Emberfall Duel — tiny synthesized sounds: WebAudio bleeps, no audio files.
// Everything is generated at run time, so the game loads nothing over the
// network and ships no sound assets.

let context = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function audioContext() {
  if (!context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function blip(freq, duration, type, gainValue, when = 0) {
  if (muted) return;
  const ctx = audioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
  gain.gain.setValueAtTime(gainValue, ctx.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + duration);
}

export function playCardSound() {
  blip(520, 0.12, 'triangle', 0.12);
  blip(780, 0.1, 'triangle', 0.08, 0.05);
}

export function hitSound() {
  blip(180, 0.18, 'sawtooth', 0.1);
  blip(120, 0.22, 'square', 0.07, 0.04);
}

export function turnSound() {
  blip(440, 0.09, 'sine', 0.09);
  blip(660, 0.09, 'sine', 0.09, 0.09);
}

export function winSound() {
  [523, 659, 784, 1047].forEach((f, i) => blip(f, 0.22, 'triangle', 0.12, i * 0.11));
}

export function loseSound() {
  [392, 330, 262, 196].forEach((f, i) => blip(f, 0.26, 'sine', 0.1, i * 0.13));
}
