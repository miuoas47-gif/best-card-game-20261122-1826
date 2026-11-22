// Emberfall Duel — boot and input: title screen, clicks and keys, the
// Warden's paced turn, and the ?shot= states used for screenshots.

import { describePlay, endTurn, isOver, newDuel, playCard } from './state.js';
import { runAiTurn } from './ai.js';
import { hideEndScreen, renderDuel, showBanner, showTable, showTitleScreen } from './render.js';
import { duelForShot } from './shots.js';
import { hitSound, loseSound, playCardSound, toggleMute, turnSound, winSound } from './sound.js';

const $ = (id) => document.getElementById(id);

let duel = null;
const ui = { selected: -1, onPlayCard: playPlayerCard, busy: false };

function freshSeed() {
  return (Date.now() % 2147483647) || 1;
}

function startDuel(seed) {
  duel = newDuel(seed);
  duel.log.push('The Warden shuffles. <b>Your move</b> — play a card, then end your turn.');
  ui.selected = -1;
  ui.busy = false;
  hideEndScreen();
  showTable();
  showBanner('YOUR TURN');
  renderDuel(duel, ui);
}

function playPlayerCard(handIndex) {
  if (!duel || duel.phase !== 'player' || ui.busy) return;
  const report = playCard(duel, 'you', handIndex);
  if (!report) return;
  ui.selected = -1;
  playCardSound();
  duel.log.push(describePlay('you', report));
  if (report.damage > 0) setTimeout(hitSound, 180);
  renderDuel(duel, ui);
  if (isOver(duel)) return endDuel();
}

function endPlayerTurn() {
  if (!duel || duel.phase !== 'player' || ui.busy) return;
  ui.busy = true;
  endTurn(duel);
  turnSound();
  showBanner('WARDEN\'S TURN');
  renderDuel(duel, ui);
  const reports = runAiTurn(duel);
  let step = 0;
  const pace = () => {
    if (step < reports.length) {
      const report = reports[step];
      step += 1;
      playCardSound();
      duel.log.push(describePlay('foe', report));
      if (report.damage > 0) setTimeout(hitSound, 180);
      renderDuel(duel, ui);
      if (isOver(duel)) return endDuel();
      setTimeout(pace, 750);
    } else {
      endTurn(duel);
      ui.busy = false;
      turnSound();
      showBanner('YOUR TURN');
      renderDuel(duel, ui);
      if (isOver(duel)) endDuel();
    }
  };
  setTimeout(pace, 700);
}

function endDuel() {
  ui.busy = false;
  renderDuel(duel, ui);
  if (duel.winner === 'you') {
    showBanner('VICTORY');
    winSound();
  } else {
    showBanner('DEFEAT');
    loseSound();
  }
}

function wireInput() {
  $('start-btn').addEventListener('click', () => startDuel(freshSeed()));
  $('again-btn').addEventListener('click', () => startDuel(freshSeed()));
  $('end-turn-btn').addEventListener('click', endPlayerTurn);
  $('mute-btn').addEventListener('click', () => {
    const muted = toggleMute();
    $('mute-btn').textContent = muted ? 'Sound: off' : 'Sound: on';
  });
  document.addEventListener('keydown', (event) => {
    if ($('title-screen').classList.contains('hidden') === false) {
      if (event.key === 'Enter' || event.key === ' ') startDuel(freshSeed());
      return;
    }
    if (event.key >= '1' && event.key <= '7') {
      playPlayerCard(Number(event.key) - 1);
    } else if (event.key === 'Enter') {
      if (!$('end-screen').classList.contains('hidden')) startDuel(freshSeed());
      else endPlayerTurn();
    } else if (event.key === 'r' || event.key === 'R') {
      startDuel(freshSeed());
    } else if (event.key === 'm' || event.key === 'M') {
      const muted = toggleMute();
      $('mute-btn').textContent = muted ? 'Sound: off' : 'Sound: on';
    }
  });
}

// Screenshot mode: ?shot=title|play|win|loss&seed=N renders one fixed
// moment of the real game, so the screenshots are the game's own code.
function bootFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1') || 1;
  wireInput();
  if (!shot || shot === 'title') {
    showTitleScreen();
    return;
  }
  const staged = duelForShot(shot, seed);
  if (!staged) {
    showTitleScreen();
    return;
  }
  duel = staged;
  showTable();
  renderDuel(duel, ui);
  if (duel.winner === 'you') winSound();
  if (duel.winner === 'foe') loseSound();
}

bootFromQuery();
