import { StateMachine } from "./StateMachine";
import { Card } from "./Card";
import multiplierData from './data/multipliers.json';
import { drawMultiplier } from "./utils/drawMultipliers";
import type { MultiplierEntry } from './types';
import { Text, Container, colorBitGl, Texture, Sprite, Assets, Spritesheet } from 'pixi.js';
import { delay } from "./utils/utility";


/**
 * Game states
 */
export enum GameState {
  INIT = "INIT",
  IDLE = "IDLE",
  ROUND_START = "ROUND_START",
  REVEAL = "REVEAL",
  RESULT = "RESULT",
}

export class Game {
  private stateMachine!: StateMachine<GameState>;
  private playRequested = false;
  private globalMultiplierValue = 0;
  private globalText!: Text;
  private globalPosition!: { x: number; y: number; };

  private multiplierTable: MultiplierEntry[] = multiplierData.multipliers;
  screenWidth: number;
  screenHeight: number;
  betText: Text;
  totalText: Text;
  constructor(
    private readonly cards: Card[],
    private readonly button: HTMLImageElement,
    private readonly uiContainer: Container,
    screenWidth: number,
    screenHeight: number,
  ) {
    this.button.onclick = () => {
      this.playRequested = true;
    };

    this.createStateMachine();

    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.globalPosition = {
      x: window.innerWidth / 2,
      y: 120,
    };

    this.betText = new Text('Game bet: 2.00',  {
      fontSize: 70,
      fill: "#fff700",
      fontFamily: "Georgia",
      fontStyle: "italic",
      fontWeight: 'bold',
      padding: 10,
      stroke: "#ff9500",
      trim: true
  });
    
    this.betText.anchor.set(0.5);
    this.betText.position.set(
      this.globalPosition.x,
      this.globalPosition.y - 80
    );
    
    this.uiContainer.addChild(this.betText);

    this.totalText = new Text('Total: ',  {
      fontSize: 70,
      fill: "#fff700",
      fontFamily: "Georgia",
      fontStyle: "italic",
      fontWeight: 'bold',
      padding: 10,
      stroke: "#ff9500",
      trim: true
  });
    
    this.totalText.anchor.set(0.5);
    this.totalText.position.set(
      this.globalPosition.x -180,
      this.globalPosition.y
    );
    
    this.uiContainer.addChild(this.totalText);
    
    this.globalText = new Text('0.00',  {
      fontSize: 70,
      fill: "#fff700",
      fontFamily: "Georgia",
      fontStyle: "italic",
      fontWeight: 'bold',
      padding: 10,
      stroke: "#ff9500",
      trim: true
  });
    
    this.globalText.anchor.set(0.5);
    this.globalText.position.set(
      this.globalPosition.x + 30,
      this.globalPosition.y
    );
    
    // this.globalText.alpha = 0;
    
    this.uiContainer.addChild(this.globalText);
    
  }

  /**
   * Called once when app is ready
   */
  start(): void {
    this.stateMachine.start(GameState.INIT);
  }

  private createStateMachine(): void {
    this.stateMachine = new StateMachine<GameState>({
      [GameState.INIT]: async () => {
        await this.loadAssets();
        this.layoutCards();
        return GameState.IDLE;
      },
  
      [GameState.IDLE]: async () => {
        this.playRequested = false;
        this.globalMultiplierValue = 0;

        await this.waitForPlayClick();
        return GameState.ROUND_START;
      },

      [GameState.ROUND_START]: async () => {
        await Promise.all(
          this.cards.map(card => card.flipToFront())
        );
        return GameState.REVEAL;
      },

      [GameState.REVEAL]: async () => {
        for (const card of this.cards) {
          const value = drawMultiplier(this.multiplierTable);
      
          card.setMultiplier(value);
          await card.showMultiplier();
        }
        return GameState.RESULT;
      },
            

      [GameState.RESULT]: async () => {
        let globalMultiplier = 1;
      
        for (const card of this.cards) {
          const value = await card.flyMultiplierToGlobal(this.globalPosition);
          globalMultiplier *= value;
      
          this.globalText.text = `${globalMultiplier.toFixed(2)}`;
          this.globalText.alpha = 1;
        }
      
        await delay(2500);
        await this.resetCards();
        this.globalText.text = '0.00';
        // this.globalText.alpha = 0;
      
        return GameState.IDLE;
      },
      
      
    });
  }

  private waitForPlayClick(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.playRequested) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  }

  private async loadAssets(): Promise<void> {
    return;
  }

  private layoutCards(): void {
    const cardCount = this.cards.length;
  
    const spacing = 300;
      const cx = this.screenWidth / 2;
      const cy = this.screenHeight / 2 + 40;
  
    this.cards.forEach((card, i) => {
      const offset = (i - (cardCount - 1) / 2) * spacing;
      card.updatePosition(cx + offset , cy);
    });

  }

  private async resetCards(): Promise<void> {
    await Promise.all(
      this.cards.map(card => card.flipToBack())
    );
  }
}
