import { Animatable } from "./enc/animation";
import { Controller, Signals } from "./enc/controller";
import playerImageAsset from "./assets/player.png";

export class Player implements Animatable {

    private playerImage: HTMLImageElement;
    private x: number;
    private y: number;
    color: string;

    constructor(private controller: Controller, public playerNumber: number) {
        this.playerImage = new Image();
        this.playerImage.src = playerImageAsset;

        this.x = 0;
        this.y = 0;

        this.color = "hsl(" + playerNumber * 360 + ",100%, 30%)"
    }

    public update = (timeDiff: number) => {
    }

    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        ctx.fillStyle = "hsl(" + this.playerNumber * 360 + ",100%, 50%)"
        ctx.drawImage(this.playerImage, this.x, this.y);
    }
}