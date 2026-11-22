// Emberfall Duel — rendering: hands, fighters, log and end screens.
// The DOM is rebuilt from the duel state on every change; CSS carries the
// slide, flip and pop animations.

import { ELEMENTS, cardById, effectText } from './cards.js';

const $ = (id) => document.getElementById(id);

export function cardElement(card, opts = {}) {
  const el = document.createElement('div');
  el.className = `card ${card.element}`;
  if (opts.unaffordable) el.classList.add('unaffordable');
  if (opts.selected) el.classList.add('selected');
  const elDef = ELEMENTS[card.element];
  const values = [];
  if (card.attack > 0) values.push(`ATK ${card.attack}`);
  const fx = effectText(card);
  el.innerHTML =
    `<div class="cost">${card.cost}</div>` +
    `<div class="card-name">${card.name}</div>` +
    `<div class="card-art">${elDef.glyph}</div>` +
    `<div class="card-values">${values.join(' · ') || '—'}</div>` +
    `<div class="card-effect">${fx || '—'}</div>` +
    `<div class="card-element">${elDef.glyph} ${elDef.name}</div>`;
  if (opts.onClick) el.addEventListener('click', opts.onClick);
  if (opts.keyHint) el.title = `Press ${opts.keyHint} to play`;
  return el;
}

export function cardBackElement() {
  const el = document.createElement('div');
  el.className = 'card card-back';
  el.innerHTML = '<div class="back-mark">▲</div><div class="back-label">EMBERFALL</div>';
  return el;
}

export function renderDuel(duel, ui) {
  // Life, guard and embers.
  $('you-life-fill').style.width = `${(duel.you.life / duel.you.maxLife) * 100}%`;
  $('foe-life-fill').style.width = `${(duel.foe.life / duel.foe.maxLife) * 100}%`;
  $('you-life-text').textContent = `${duel.you.life} / ${duel.you.maxLife}`;
  $('foe-life-text').textContent = `${duel.foe.life} / ${duel.foe.maxLife}`;
  renderGuard($('you-guard'), duel.you.guard);
  renderGuard($('foe-guard'), duel.foe.guard);
  $('you-ember').textContent = '●'.repeat(duel.you.ember) + '○'.repeat(Math.max(0, duel.you.maxEmber - duel.you.ember));
  $('foe-ember').textContent = '●'.repeat(duel.foe.ember) + '○'.repeat(Math.max(0, duel.foe.maxEmber - duel.foe.ember));
  $('score-line').textContent = `Score ${duel.score}`;
  $('turn-line').textContent = `Turn ${duel.turn}`;

  // Opponent hand: face-down backs, so the rival's plan stays hidden.
  const foeHand = $('foe-hand');
  foeHand.replaceChildren();
  duel.foe.hand.forEach(() => foeHand.appendChild(cardBackElement()));

  // Player hand: face-up, clickable while it is your turn.
  const yourHand = $('player-hand');
  yourHand.replaceChildren();
  duel.you.hand.forEach((cardId, i) => {
    const card = cardById(cardId);
    const playable = duel.phase === 'player' && duel.you.ember >= card.cost;
    yourHand.appendChild(cardElement(card, {
      unaffordable: duel.phase === 'player' && duel.you.ember < card.cost,
      selected: ui.selected === i,
      keyHint: String(i + 1),
      onClick: playable || duel.phase === 'player' ? () => ui.onPlayCard(i) : undefined,
    }));
  });

  // Last cards played, one line each.
  renderPlayed($('player-played'), 'You', duel.lastPlayed.you);
  renderPlayed($('foe-played'), 'Warden', duel.lastPlayed.foe);

  // Log keeps the last two lines.
  $('log').innerHTML = duel.log.slice(-2).join('<br>') || 'Your move — play a card, then end your turn.';
  $('end-turn-btn').disabled = duel.phase !== 'player';

  if (duel.phase === 'over') showEndScreen(duel);
}

function renderGuard(el, guard) {
  el.classList.toggle('hidden', guard <= 0);
  el.textContent = `🛡 ${guard}`;
}

function renderPlayed(container, who, card) {
  container.replaceChildren();
  if (!card) return;
  const el = document.createElement('div');
  el.className = 'mini-card';
  const elDef = ELEMENTS[card.element];
  el.textContent = `${who}: ${elDef.glyph} ${card.name} — ATK ${card.attack}, cost ${card.cost}`;
  container.appendChild(el);
}

export function showBanner(text) {
  const banner = $('phase-banner');
  banner.textContent = text;
  banner.classList.remove('pop');
  void banner.offsetWidth; // restart the animation
  banner.classList.add('pop');
}

export function showTitleScreen() {
  $('title-screen').classList.remove('hidden');
  $('table').classList.add('hidden');
  $('scoreboard').classList.add('hidden');
  $('end-screen').classList.add('hidden');
}

export function showTable() {
  $('title-screen').classList.add('hidden');
  $('end-screen').classList.add('hidden');
  $('table').classList.remove('hidden');
  $('scoreboard').classList.remove('hidden');
}

export function showEndScreen(duel) {
  const won = duel.winner === 'you';
  $('end-title').textContent = won ? 'VICTORY' : 'DEFEAT';
  $('end-title').className = won ? 'win' : 'lose';
  $('end-text').textContent = won
    ? 'The Cinder Warden\'s last ember gutters out. The table is yours — the four elements bow to the Emberkeeper.'
    : 'Your embers scatter across the table. The Cinder Warden gathers them up, smiling. Deal again — the elements favour the bold.';
  $('end-stats').innerHTML =
    `<span><b>${duel.score}</b>damage dealt</span>` +
    `<span><b>${duel.turn}</b>turns</span>` +
    `<span><b>${duel.cardsPlayed}</b>cards played</span>`;
  $('end-screen').classList.remove('hidden');
}

export function hideEndScreen() {
  $('end-screen').classList.add('hidden');
}
