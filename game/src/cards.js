// Emberfall Duel — the cards: definitions, elements, deck building and shuffling.
// Every card is an original design for this game: four elements, a cost in
// embers, an attack value, and an optional effect (guard, heal or draw).

export const ELEMENTS = {
  flame: { name: 'Flame', glyph: '▲', beats: 'thorn', color: '#c23b1e' },
  thorn: { name: 'Thorn', glyph: '✦', beats: 'tide', color: '#2e7d32' },
  tide: { name: 'Tide', glyph: '●', beats: 'stone', color: '#1f6fb2' },
  stone: { name: 'Stone', glyph: '◆', beats: 'flame', color: '#8d6e3f' },
};

// A card's element beats exactly one other element. Playing a card whose
// element beats the rival's last played element adds +2 damage.
export function elementBeats(a, b) {
  return ELEMENTS[a] && ELEMENTS[a].beats === b;
}

export const CARD_LIBRARY = [
  { id: 'ember-spark', name: 'Ember Spark', element: 'flame', cost: 1, attack: 2, effect: null, text: 'A quick lick of flame.' },
  { id: 'tide-lash', name: 'Tide Lash', element: 'tide', cost: 2, attack: 3, effect: null, text: 'A cold whip of water.' },
  { id: 'thorn-snare', name: 'Thorn Snare', element: 'thorn', cost: 2, attack: 2, effect: { guard: 3 }, text: 'Snares the foe. Guard +3.' },
  { id: 'stone-fist', name: 'Stone Fist', element: 'stone', cost: 3, attack: 4, effect: null, text: 'A heavy, honest punch.' },
  { id: 'flameburst', name: 'Flameburst', element: 'flame', cost: 4, attack: 6, effect: null, text: 'The whole hearth, at once.' },
  { id: 'deep-current', name: 'Deep Current', element: 'tide', cost: 3, attack: 3, effect: { draw: 1 }, text: 'Draw a card.' },
  { id: 'briar-shield', name: 'Briar Shield', element: 'thorn', cost: 1, attack: 0, effect: { guard: 6 }, text: 'Guard +6. No attack.' },
  { id: 'quake-slam', name: 'Quake Slam', element: 'stone', cost: 5, attack: 7, effect: null, text: 'The floor itself objects.' },
  { id: 'phoenix-rise', name: 'Phoenix Rise', element: 'flame', cost: 4, attack: 3, effect: { heal: 4 }, text: 'Heal 4 life.' },
  { id: 'mist-veil', name: 'Mist Veil', element: 'tide', cost: 2, attack: 1, effect: { guard: 4, draw: 1 }, text: 'Guard +4. Draw a card.' },
  { id: 'vine-whip', name: 'Vine Whip', element: 'thorn', cost: 3, attack: 5, effect: null, text: 'Fast, green and mean.' },
  { id: 'ember-golem', name: 'Ember Golem', element: 'stone', cost: 6, attack: 9, effect: null, text: 'Nine tons of burning rock.' },
  { id: 'cinder-fan', name: 'Cinder Fan', element: 'flame', cost: 2, attack: 3, effect: { draw: 1 }, text: 'Draw a card.' },
  { id: 'undertow', name: 'Undertow', element: 'tide', cost: 4, attack: 5, effect: null, text: 'Drags the rival under.' },
  { id: 'root-bind', name: 'Root Bind', element: 'thorn', cost: 1, attack: 1, effect: { guard: 2 }, text: 'Guard +2.' },
  { id: 'pebble-storm', name: 'Pebble Storm', element: 'stone', cost: 2, attack: 2, effect: { draw: 1 }, text: 'Draw a card.' },
];

export function cardById(id) {
  return CARD_LIBRARY.find((c) => c.id === id);
}

// A small deterministic RNG so screenshot states and replays are stable.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a 26-card deck: two copies of the cheap cards, one of the rest,
// then shuffle with the given RNG. Both duelists draw from identical decks.
export function buildDeck(rng) {
  const deck = [];
  for (const card of CARD_LIBRARY) {
    const copies = card.cost <= 2 ? 2 : 1;
    for (let i = 0; i < copies; i++) deck.push(card.id);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Describe a card's effect in plain words for the card face.
export function effectText(card) {
  const parts = [];
  if (card.effect) {
    if (card.effect.guard) parts.push(`Guard +${card.effect.guard}`);
    if (card.effect.heal) parts.push(`Heal ${card.effect.heal}`);
    if (card.effect.draw) parts.push(`Draw ${card.effect.draw}`);
  }
  return parts.join(' · ');
}
