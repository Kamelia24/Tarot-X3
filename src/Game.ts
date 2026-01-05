import { Application, Resource, Text, TextStyle, Texture } from "pixi.js";
import { Camera3d, Container3d } from "pixi-projection";
import { Card } from "./Card";
import multipliersData from "./data/multipliers.json";
import { StateMachine } from "./StateMachine";
import { delay } from "./utils/utility";

export class Game {
  app: Application;
  camera: Camera3d;
  cards: Card[] = [];
  multipliers = multipliersData;
  stateMachine = new StateMachine();

  globalMultiplierText: Text;

  constructor(app: Application) {
    this.app = app;
    this.camera = new Camera3d();
    this.camera.position.set(app.screen.width / 2, app.screen.height / 2 - 50);
    this.camera.position.z = -200;
    this.camera.euler.x = 0.8;
    this.camera.setPlanes(1000, 50, 2000);
    this.app.stage.addChild(this.camera);

    this.globalMultiplierText = new Text("", new TextStyle({
      fontSize: 60,
      fontWeight: "bold",
      fill: "#ffeb3b",
      align: "center"
    }));
    this.globalMultiplierText.anchor.set(0.5);
    this.globalMultiplierText.position.set(app.screen.width / 2, 100);
    this.globalMultiplierText.visible = false;
    this.app.stage.addChild(this.globalMultiplierText);
  }

  addCards(frontTex: Texture, backTex: Texture) {
    this.cards = [
      new Card(frontTex, backTex),
      new Card(frontTex, backTex),
      new Card(frontTex, backTex),
    ];
    const spacing = 200;
    const startX = -spacing;
    this.cards.forEach((card, i) => {
      card.position3d.x = startX + i * spacing;
      this.camera.addChild(card);
    });
  }

  pickMultiplier(): number {
    const total = this.multipliers.reduce((sum, m) => sum + m.weight, 0);
    let rand = Math.random() * total;
    for (const m of this.multipliers) {
      if (rand < m.weight) return m.value;
      rand -= m.weight;
    }
    return this.multipliers[0].value;
  }

  private async flipAllFront() {
    await Promise.all(
      this.cards.map(
        (c) =>
          new Promise<void>((resolve) => {
            const update = () => {
              c.update(() => resolve());
              if (c.flipping) requestAnimationFrame(update);
            };
            c.flipToFront();
            update();
          })
      )
    );
  }

  private async flipAllBack() {
    await Promise.all(
      this.cards.map(
        (c) =>
          new Promise<void>((resolve) => {
            const update = () => {
              c.update(() => resolve());
              if (c.flipping) requestAnimationFrame(update);
            };
            c.flipToBack();
            update();
          })
      )
    );
  }

  public async startRound() {
    if (this.stateMachine.getState() !== "IDLE") {
      return;
    }
    await this.stateMachine.enterState("ROUND_START", async () => {
      await this.flipAllFront();
    });

    await this.stateMachine.enterState("REVEAL", async () => {
      this.cards.forEach((c) => {
        const mult = this.pickMultiplier();
        c.setMultiplier(mult);
        c.multiplierText.visible = false;
      });

      await delay(500);
      this.cards.forEach((c) => (c.multiplierText.visible = true));
    });

    await this.stateMachine.enterState("RESULT", async () => {
      let total = 1;
      this.cards.forEach((c) => {
        const num = parseFloat(c.multiplierText.text.replace("x", "")) || 1;
        total *= num;
      });
      this.globalMultiplierText.text = `x${total}`;
      this.globalMultiplierText.visible = true;
      await delay(1500);
    });

    await this.stateMachine.enterState("BACK", async () => {
      this.globalMultiplierText.visible = false;

      await this.flipAllBack();
    });

    await this.stateMachine.enterState("IDLE");
  }
}
