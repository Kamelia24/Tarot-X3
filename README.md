# Pixi Card Game

A card flipping game built with PixiJS 8 and TypeScript.

---

## How to Run

```bash
# Using npm
npm install
npm run dev

Open the browser at the address shown (usually http://localhost:5173).

Game State Flow

Idle: waiting for the user to click the button.

RoundStart: cards flip.

Reveal: each card displays its multiplier.

Result: multipliers fly to a global counter and combine.

Idle: cards reset for the next round.

Idle → RoundStart → Reveal → Result → Idle

What I Would Do Next: 

Add particle effects when multipliers combine.
Add sound effects for flips, multiplier collection, etc..
Add animations for button hover/click.
Make it fully responsive for mobile devices.
Add more complex game logic like bonus rounds or jackpots.
Add options for changing bet.
Make better UI.
Make win bar holding the total win from all rounds.
Show the available sum for betting.
Better and more realistic flipping animation.
Better looking multipliers with custom font.
Add background.

AI was used for creating card back and front assets.