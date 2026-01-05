import { Application, Assets, MIPMAP_MODES, SCALE_MODES, Sprite } from "pixi.js";
import { Game } from "./Game";
import { BACKGROUND, BUTTON_SRC, CARD_BACK, CARD_FRONT } from "./constants";

const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0x1099bb,
  antialias: true,
  resolution: window.devicePixelRatio || 2,
  autoDensity: true,
  resizeTo: window,
});
document.body.appendChild(app.view as HTMLCanvasElement);

async function main() {
  const frontTex = await Assets.load(CARD_FRONT);
  const backTex = await Assets.load(CARD_BACK);
  const background = await Assets.load(BACKGROUND);


  const bg = new Sprite(background);
  bg.anchor.set(0.5);
  bg.position.set(app.screen.width / 2, app.screen.height / 2);

  bg.width = app.screen.width;
  bg.height = app.screen.height;
  app.stage.addChildAt(bg, 0);

  const game = new Game(app);

  game.addCards(frontTex, backTex);

  const button = document.createElement('img');
  button.src = BUTTON_SRC;
  button.style.position = 'absolute';
  button.style.bottom = '40px';
  button.style.left = '50%';
  button.style.transform = 'translateX(-50%)';
  button.style.cursor = 'pointer';
  button.style.width = '120px';
  document.body.appendChild(button);

  button.addEventListener("click", () => {
    game.startRound();
  });
}

main();
