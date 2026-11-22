// Emberfall Duel — screenshot states: deterministic tableaus of the real game,
// driven by the same rules a player uses. The starter's shots.json pattern:
// ?shot=title|play|win|loss&seed=1 renders one fixed moment for the camera.

import { cardById } from './cards.js';
import { describePlay, endTurn, newDuel, playCard } from './state.js';
import { runAiTurn } from './ai.js';

// Play a card by id from a fighter's hand, if it is there and affordable.
function playNamed(duel, who, cardId) {
  const index = duel[who].hand.indexOf(cardId);
  if (index < 0) return null;
  return playCard(duel, who, index);
}

function logPlay(duel, who, report) {
  if (report) duel.log.push(describePlay(who, report));
}

// A lively mid-game table: two turns each, cards on both sides, guard up,
// life chipped away, embers spent — the duel at its most readable.
function stageMidGame(seed) {
  const duel = newDuel(seed);
  duel.you.ember = 6;
  duel.you.maxEmber = 6;
  duel.foe.ember = 6;
  duel.foe.maxEmber = 6;
  // Seed both hands with a spread of elements so the table shows variety.
  duel.you.hand = ['flameburst', 'tide-lash', 'thorn-snare', 'stone-fist', 'mist-veil', 'ember-spark'];
  duel.foe.hand = ['quake-slam', 'vine-whip', 'deep-current', 'briar-shield', 'cinder-fan', 'pebble-storm'];
  logPlay(duel, 'you', playNamed(duel, 'you', 'flameburst'));
  logPlay(duel, 'you', playNamed(duel, 'you', 'thorn-snare'));
  endTurn(duel);
  for (const report of runAiTurn(duel)) logPlay(duel, 'foe', report);
  endTurn(duel);
  duel.you.ember = 5;
  logPlay(duel, 'you', playNamed(duel, 'you', 'tide-lash'));
  return duel;
}

// A win, earned through the rules: the Warden is left at 3 life and a
// Flameburst finishes the duel.
function stageWin(seed) {
  const duel = stageMidGame(seed);
  duel.foe.life = 3;
  duel.foe.guard = 0;
  duel.you.hand = ['flameburst', 'ember-spark', 'mist-veil'];
  duel.you.ember = 6;
  logPlay(duel, 'you', playNamed(duel, 'you', 'flameburst'));
  return duel;
}

// A loss, earned the same way: the Emberkeeper is left at 3 life and the
// Warden's golem ends it.
function stageLoss(seed) {
  const duel = stageMidGame(seed);
  duel.you.life = 3;
  duel.you.guard = 0;
  duel.foe.hand = ['ember-golem', 'stone-fist', 'tide-lash'];
  duel.foe.ember = 8;
  duel.phase = 'ai';
  logPlay(duel, 'foe', playNamed(duel, 'foe', 'ember-golem'));
  return duel;
}

// Build the duel for a screenshot query. Returns null for the title screen.
export function duelForShot(shot, seed) {
  if (shot === 'play') return stageMidGame(seed);
  if (shot === 'win') return stageWin(seed);
  if (shot === 'loss') return stageLoss(seed);
  return null;
}

export function cardName(id) {
  return cardById(id).name;
}
