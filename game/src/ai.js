// Emberfall Duel — the Cinder Warden's brain: a readable, beatable rival.
// It weighs each card in hand, plays the best value it can afford, guards
// when its life is low, and stops when nothing left is worth the embers.

import { cardById, elementBeats } from './cards.js';
import { canAfford, playCard } from './state.js';

// Score one card as the Warden would see it: damage first, survival when
// hurt, and a bonus for chaining the elemental advantage.
export function scoreCardForAi(duel, card) {
  let value = card.attack * 2;
  if (card.effect?.guard) value += card.effect.guard * (duel.foe.life <= 10 ? 2.5 : 1.2);
  if (card.effect?.heal) value += card.effect.heal * (duel.foe.life <= 12 ? 2 : 0.8);
  if (card.effect?.draw) value += 2;
  const yourLast = duel.lastPlayed.you;
  if (yourLast && elementBeats(card.element, yourLast.element)) value += 4;
  // Cheap cards are efficient; an expensive card must earn its embers.
  value -= card.cost * 0.6;
  return value;
}

// Pick the Warden's next move: the index in its hand of the best affordable
// card, or -1 when it should stop playing.
export function chooseAiCard(duel) {
  let bestIndex = -1;
  let bestValue = 2.5; // below this, holding the embers is better
  duel.foe.hand.forEach((cardId, index) => {
    const card = cardById(cardId);
    if (!canAfford(duel.foe, card)) return;
    const value = scoreCardForAi(duel, card);
    if (value > bestValue) {
      bestValue = value;
      bestIndex = index;
    }
  });
  return bestIndex;
}

// Play the Warden's whole turn: one card at a time with a report per card,
// so the renderer can pace them out. Returns the list of reports.
export function runAiTurn(duel) {
  const reports = [];
  for (let guard = 0; guard < 6; guard++) {
    if (duel.phase === 'over') break;
    const index = chooseAiCard(duel);
    if (index < 0) break;
    const report = playCard(duel, 'foe', index);
    if (report) reports.push(report);
  }
  return reports;
}
