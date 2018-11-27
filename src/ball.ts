import { Animatable } from "./enc/animation";
import { Controller, Signals } from "./enc/controller";
import ballImageAsset from "./assets/ball.png";
import { Helper } from "./enc/helper";
import { Rectangle } from "./enc/rectangle";

export class Ball implements Animatable {
    private ballImage: HTMLImageElement;
    public x: number;
    public y: number;

    constructor() {
        this.ballImage = new Image();
        this.ballImage.src = ballImageAsset;
        Helper.colorImage(this.ballImage, Math.random() * 360);
        this.x = 0;
        this.y = 0;
    }

    public getHitRect = () => {
        return new Rectangle(this.x - this.ballImage.naturalWidth / 2, this.y, this.ballImage.naturalWidth, this.ballImage.naturalHeight);
    }

    public color = (playerNumber: number) => {
        console.log("color");
        
        Helper.colorImageAny(this.ballImage, playerNumber * 360)
    }

    public update = (timeDiff: number) => {
    }

    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        ctx.drawImage(this.ballImage, this.x - this.ballImage.naturalWidth / 2, this.y);
    }
}