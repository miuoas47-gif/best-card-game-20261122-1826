// Emberfall Duel — the duel state: life, embers, hands, decks and turn flow.
// Pure rules live here; rendering lives in render.js and the rival's
// decisions live in ai.js.

import { buildDeck, cardById, elementBeats, mulberry32 } from './cards.js';

export const START_LIFE = 24;
export const MAX_EMBER = 10;
export const MAX_HAND = 7;
export const ELEMENT_BONUS = 2;

export function newDuel(seed) {
  const rng = mulberry32(seed);
  const duel = {
    seed,
    rng,
    turn: 1,
    phase: 'player', // 'player' | 'ai' | 'over'
    winner: null,
    you: freshFighter(rng),
    foe: freshFighter(rng),
    lastPlayed: { you: null, foe: null },
    score: 0, // total damage you have dealt
    cardsPlayed: 0,
    log: [],
  };
  drawCards(duel.you, 4);
  drawCards(duel.foe, 4);
  // The first duelist opens with one extra ember: endTurn raises the
  // incoming side's ember cap, so without this the Warden would play every
  // round with one ember more than you. With it both sides match from turn 1.
  duel.you.maxEmber = 3;
  duel.you.ember = 3;
  duel.foe.ember = 2;
  return duel;
}

function freshFighter(rng) {
  return {
    life: START_LIFE,
    maxLife: START_LIFE,
    guard: 0,
    ember: 0,
    maxEmber: 2,
    deck: buildDeck(rng),
    hand: [],
    discard: [],
  };
}

export function drawCards(fighter, n) {
  for (let i = 0; i < n; i++) {
    if (fighter.hand.length >= MAX_HAND) return;
    if (fighter.deck.length === 0) {
      fighter.deck = fighter.discard.splice(0).reverse();
      if (fighter.deck.length === 0) return;
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

export function canAfford(fighter, card) {
  return fighter.ember >= card.cost;
}

// Play one card from a fighter's hand. Returns a report of what happened,
// or null when the card cannot be played.
export function playCard(duel, who, handIndex) {
  const fighter = duel[who];
  const rival = duel[who === 'you' ? 'foe' : 'you'];
  const cardId = fighter.hand[handIndex];
  if (cardId === undefined) return null;
  const card = cardById(cardId);
  if (!canAfford(fighter, card)) return null;

  fighter.hand.splice(handIndex, 1);
  fighter.discard.push(cardId);
  fighter.ember -= card.cost;
  duel.cardsPlayed += 1;

  const rivalLast = duel.lastPlayed[who === 'you' ? 'foe' : 'you'];
  const advantage = rivalLast && elementBeats(card.element, rivalLast.element);
  let damage = card.attack + (advantage ? ELEMENT_BONUS : 0);

  if (card.effect?.guard) fighter.guard += card.effect.guard;
  if (card.effect?.heal) fighter.life = Math.min(fighter.maxLife, fighter.life + card.effect.heal);
  if (card.effect?.draw) drawCards(fighter, card.effect.draw);

  let soaked = 0;
  if (damage > 0) {
    soaked = Math.min(rival.guard, damage);
    rival.guard -= soaked;
    rival.life -= (damage - soaked);
    if (who === 'you') duel.score += (damage - soaked);
  }

  duel.lastPlayed[who] = card;
  if (rival.life <= 0) {
    rival.life = 0;
    duel.phase = 'over';
    duel.winner = who;
  }
  return { card, damage, soaked, advantage, healed: card.effect?.heal || 0 };
}

// End the current side's turn: the other side gains an ember and draws.
export function endTurn(duel) {
  if (duel.phase === 'over') return;
  const next = duel.phase === 'player' ? 'foe' : 'you';
  const fighter = duel[next];
  fighter.maxEmber = Math.min(MAX_EMBER, fighter.maxEmber + 1);
  fighter.ember = fighter.maxEmber;
  drawCards(fighter, 1);
  duel.phase = next === 'you' ? 'player' : 'ai';
  if (next === 'you') duel.turn += 1;
}

export function isOver(duel) {
  return duel.phase === 'over';
}

export function describePlay(who, report) {
  const name = who === 'you' ? 'You' : 'The Warden';
  const { card, damage, soaked, advantage, healed } = report;
  const bits = [`${name} played <b>${card.name}</b>`];
  if (damage > 0) {
    bits.push(`for <b>${damage}</b> damage${advantage ? ' (+2 elemental advantage!)' : ''}`);
    if (soaked > 0) bits.push(`(${soaked} soaked by guard)`);
  }
  if (healed > 0) bits.push(`and healed ${healed}`);
  if (card.effect?.guard) bits.push(`and raised Guard +${card.effect.guard}`);
  if (card.effect?.draw) bits.push(`and drew a card`);
  return bits.join(' ');
}
