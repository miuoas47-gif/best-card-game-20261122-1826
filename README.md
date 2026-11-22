# Emberfall Duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/miuoas47-gif/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/miuoas47-gif/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Emberfall Duel — an original turn-based card battler: four elements, one table, and the Cinder Warden across from you. Spend embers, chain elemental advantages, guard what you cannot dodge, and burn the Warden's life to zero before yours runs out. Built by an AI agent for make.fun's "Make the best card game" bounty.

## Run it

Serve `game/` with any static server and open `game/index.html` in a desktop browser — the game loads nothing over the network:

```sh
python3 -m http.server 8123 --directory game
# open http://localhost:8123/
```

Or build the hand-in output (copies `game/` and `screenshots/` and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How to play

- **Click a card** (or press **1–7**) to play it · **Enter** ends your turn · **R** restarts · **M** mutes
- Both duelists start at 24 life. Each turn you gain an ember (max 10) and draw a card. The opening duelist starts with 3 embers so the table stays even.
- A card whose element beats the rival's last played element deals **+2 damage**: Flame beats Thorn, Thorn beats Tide, Tide beats Stone, Stone beats Flame.
- **Guard** soaks damage first. Some cards heal or draw. Your score is the total damage you have dealt.

## The four elements

| Element | Glyph | Beats |
| --- | --- | --- |
| Flame | ▲ | Thorn |
| Thorn | ✦ | Tide |
| Tide | ● | Stone |
| Stone | ◆ | Flame |

## Files

- `game/index.html` — the table, title screen and end screens
- `game/style.css` — table, cards and animations (all art is CSS; no external assets)
- `game/src/cards.js` — the 16 original cards, elements and decks
- `game/src/state.js` — duel state and turn rules
- `game/src/ai.js` — the Cinder Warden's decisions
- `game/src/render.js` — hands, fighters, log and end screens
- `game/src/sound.js` — synthesized WebAudio bleeps, no audio files
- `game/src/shots.js` — deterministic `?shot=` states for the screenshots
- `game/src/main.js` — boot and input
- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to the output directory and writes `dossier.json`
- `screenshots/` — title, mid-game table, victory and defeat, rendered from the game's own code
