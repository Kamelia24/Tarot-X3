import { Application, Assets, colorBitGl, Container } from 'pixi.js';
import { Game } from './Game';
import { Card } from './Card';
import {
  CARD_BACK,
  CARD_FRONT,
  BUTTON_SRC,
} from './constants';
import type { CameraConfig } from './types.ts';

const app = new Application();

await app.init({
  width: window.innerWidth, 
    height: window.innerHeight,
  backgroundColor: 0x1099bb,
});

document.body.appendChild(app.canvas);

const CAMERA: CameraConfig = {
  vx: () => app.screen.width / 2,
  vy: () => app.screen.height * 0.15,
  xDepthNear: 1,
  xDepthFar: 0.72,
};

await Assets.load([
  CARD_BACK,
  CARD_FRONT,
  BUTTON_SRC,
]);

const cardLayer = new Container();
app.stage.addChild(cardLayer);

const uiLayer = new Container();
app.stage.addChild(uiLayer);

const cards: Card[] = [0, 1, 2].map((i: any) => {
  return new Card(
    Assets.get(CARD_FRONT),
    Assets.get(CARD_BACK),
    cardLayer,
    CAMERA
  );
});

const button = document.createElement('img');
button.src = BUTTON_SRC;
button.style.position = 'absolute';
button.style.bottom = '40px';
button.style.left = '50%';
button.style.transform = 'translateX(-50%)';
button.style.cursor = 'pointer';
button.style.width = '120px';
document.body.appendChild(button);

const game = new Game(cards, button, uiLayer, app.screen.width, app.screen.height);
game.start();
