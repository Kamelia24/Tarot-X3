import { PerspectiveMesh, Text, Texture, Container } from 'pixi.js';
import { delay } from './utils/utility';

export interface CameraConfig {
  vx: () => number;
  xDepthNear: number;
  xDepthFar: number;
}

export interface Point {
  x: number;
  y: number;
}

const raf = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

export class Card {
  public baseX = 0;
  public baseY = 0;

  private readonly w: number;
  private readonly h: number;

  private readonly mesh: PerspectiveMesh;
  private readonly multiplier: Text = new Text;

  private angle = 0;

  private showingFront = false;
  private multiplierValue = 0;
  private multiplierText: Text;


  constructor(
    private readonly front: Texture,
    private readonly back: Texture,
    private readonly container: Container,
    private readonly camera: CameraConfig
  ) {
    this.w = front.width;
    this.h = front.height * 0.6;

    this.mesh = new PerspectiveMesh({
      texture: this.back,
      verticesX: 8,
      verticesY: 8,
    });

    this.container.addChild(this.mesh);

    this.multiplierText = new Text('x0', {
      fontSize: 35,
      fill: "#fff700",
      fontFamily: "Georgia",
      fontStyle: "italic",
      fontWeight: 'bold',
      padding: 10,
      stroke: "#ff9500",
      trim: true
  });

    this.multiplierText.anchor.set(0.5);
    this.multiplierText.alpha = 0;
    
    this.container.addChild(this.multiplierText);
    
    this.project();
  }

  async flipToFront(): Promise<void> {
    if (this.showingFront) return;
    await this.flip(this.back, this.front);
    this.showingFront = true;
  }

  async flipToBack(): Promise<void> {
    if (!this.showingFront) return;
    await this.flip(this.front, this.back);
    this.showingFront = false;
  }

  setMultiplier(value: number): void {
    this.multiplierValue = value;
    this.multiplierText.text = `x${value}`;
  }

  async showMultiplier(): Promise<void> {
    const center = this.getProjectedCenter();
    this.multiplierText.position.set(center.x, center.y -30);
    this.multiplierText.alpha = 1;
  
    await delay(200);
  }  

  async flyMultiplierToGlobal(target: { x: number; y: number }): Promise<number> {
    return new Promise(resolve => {
      const animate = () => {
        this.multiplierText.x += (target.x - this.multiplierText.x) * 0.15;
        this.multiplierText.y += (target.y - this.multiplierText.y) * 0.15;
  
        if (
          Math.abs(this.multiplierText.x - target.x) < 1 &&
          Math.abs(this.multiplierText.y - target.y) < 1
        ) {
          this.multiplierText.alpha = 0;
          resolve(this.multiplierValue);
          return;
        }
  
        requestAnimationFrame(animate);
      };
  
      animate();
    });
  }
  
  reset(): void {
    this.mesh.texture = this.back;
    this.multiplier.alpha = 0;
    this.multiplier.scale.set(1);
    this.angle = 0;
    this.showingFront = false;
    this.project();
  }

  private async flip(from: Texture, to: Texture): Promise<void> {
    this.mesh.texture = from;
    this.angle = 0;

    while (this.angle < Math.PI) {
      this.angle += 0.04;

      if (this.angle > Math.PI / 2 && this.mesh.texture !== to) {
        this.mesh.texture = to;
      }

      this.project();
      this.updateMultiplierProjection();

      await raf();
    }

    this.angle = Math.PI;
    this.project();
    this.updateMultiplierProjection();
  }

  private project(): void {
    const hw = this.w;
    const hh = this.h / 2;

    const lift = Math.sin(this.angle) * 300;
    const yTop = this.baseY - hh - lift;
    const yBottom = this.baseY + hh - lift;

    const cosA = Math.abs(Math.cos(this.angle));
    const pivotX = this.baseX;

    const corners = [
      { x: pivotX - hw / 2 * cosA, y: yTop },
      { x: pivotX + hw / 2 * cosA, y: yTop },
      { x: pivotX + hw / 2 * cosA, y: yBottom },
      { x: pivotX - hw / 2 * cosA, y: yBottom },
    ];

    const vx = this.camera.vx();

    const projected = corners.map(p => {
      const t = (p.y - yTop) / (yBottom - yTop);
      const depth =
        this.camera.xDepthFar * (1 - t) +
        this.camera.xDepthNear * t;

      return {
        x: vx + (p.x - vx) * depth,
        y: p.y,
      };
    });

    this.mesh.setCorners(
      projected[0].x, projected[0].y,
      projected[1].x, projected[1].y,
      projected[2].x, projected[2].y,
      projected[3].x, projected[3].y
    );
  }

  private updateMultiplierProjection(): void {
    const center = this.getProjectedCenter();
    this.multiplier.x = center.x;
    this.multiplier.y = center.y;
  }

  private getProjectedCenter(): Point {
    const hh = this.h / 2;
    const lift = Math.sin(this.angle) * 300;

    const yTop = this.baseY - hh - lift;
    const yBottom = this.baseY + hh - lift;

    const centerY = (yTop + yBottom) / 2;

    const vx = this.camera.vx();
    const t = (centerY - yTop) / (yBottom - yTop);

    const depth =
      this.camera.xDepthFar * (1 - t) +
      this.camera.xDepthNear * t;

    return {
      x: vx + (this.baseX - vx) * depth,
      y: centerY,
    };
  }

  public updatePosition(baseX: number, baseY: number): void {
    this.baseX = baseX;
    this.baseY = baseY;
    this.project();
  }
}
