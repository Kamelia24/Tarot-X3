import { Container3d, Sprite3d, Text3d } from "pixi-projection";
import { Texture, TextStyle } from "pixi.js";

export class Card extends Container3d {
    front: Sprite3d;
    back: Sprite3d;
    multiplierText: Text3d;

    public flipping = false;
    private flipProgress = 0;
    private flipSpeed = 0.03;
    private flipHeight = 100;

    public currentSide: "front" | "back" = "back";
    private targetSide: "front" | "back" = "back";

    constructor(frontTex: Texture, backTex: Texture) {
        super();

        this.front = new Sprite3d(frontTex);
        this.front.anchor.set(0.5);
        this.front.width = 150;
        this.front.height = 200;
        this.addChild(this.front);

        this.back = new Sprite3d(backTex);
        this.back.anchor.set(0.5);
        this.back.width = 150;
        this.back.height = 200;
        this.back.euler.y = Math.PI;
        this.addChild(this.back);

        const textStyle = new TextStyle({
            fontSize: 40,
            fontWeight: "bold",
            fill: "#ffeb3b",
            align: "center",
        });

        this.multiplierText = new Text3d("", textStyle);
        this.multiplierText.anchor.set(0.5);
        this.multiplierText.position3d.x = 0;
        this.multiplierText.position3d.y = 0;
        this.multiplierText.position3d.z = 2;
        this.multiplierText.visible = false;

        this.addChild(this.multiplierText);

        this.updateSide();
    }

    public setMultiplier(mult: number) {
        this.multiplierText.text = mult;
    }

    public flipToFront() {
        if (!this.flipping && this.currentSide === "back") {
            this.flipping = true;
            this.flipProgress = 0;
            this.targetSide = "front";
            this.multiplierText.visible = false;
        }
    }

    public flipToBack() {
        if (!this.flipping && this.currentSide === "front") {
            this.flipping = true;
            this.flipProgress = 0;
            this.targetSide = "back";
            this.multiplierText.visible = false;
        }
    }

    public update(onFlipComplete?: (c: Card) => void) {
        if (!this.flipping) return;

        this.flipProgress += this.flipSpeed;

        if (this.flipProgress >= 1) {
            this.flipProgress = 1;
            this.flipping = false;

            this.currentSide = this.targetSide;
            this.updateSide();

            if (onFlipComplete) onFlipComplete(this);

            this.position3d.y = 0;
            this.position3d.z = 0;

            this.updateTransform();
            return;
        }

        const start = this.currentSide === "front" ? 0 : Math.PI;
        const end = this.targetSide === "front" ? 0 : Math.PI;
        this.euler.y = start + (end - start) * this.flipProgress;

        const direction = this.targetSide === "front" ? 1 : -1;
        const height = Math.sin(this.flipProgress * Math.PI) * this.flipHeight * -1;
        this.position3d.y = height;

        this.front.euler.y = 0;
        this.back.euler.y = Math.PI;

        this.updateTransform();
    }

    private updateSide() {
        this.front.visible = this.currentSide === "front";
        this.back.visible = this.currentSide === "back";
    }
}
