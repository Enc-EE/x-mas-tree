import { Animatable } from "./enc/animation";
import { Controller, Signals } from "./enc/controller";
import playerImageAsset from "./assets/player.png";

export class Player implements Animatable {

    private playerImage: HTMLImageElement;
    private x: number;
    private y: number;
    color: string;
    moveLeft: boolean;
    vy: number;
    g: number;
    isJumping: boolean;
    baseY: number;

    constructor(private controller: Controller, public playerNumber: number) {
        this.playerImage = new Image();
        this.playerImage.src = playerImageAsset;
        this.playerImage.onload = () => {
            var tempCanvas = document.createElement("canvas");
            tempCanvas.width = this.playerImage.naturalWidth;
            tempCanvas.height = this.playerImage.naturalHeight;

            var tempCtx = tempCanvas.getContext("2d");

            tempCtx.drawImage(this.playerImage, 0, 0);
            var imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

            for (let i = 0; i < imageData.data.length; i = i + 4) {
                var r = imageData.data[i];
                var g = imageData.data[i + 1];
                var b = imageData.data[i + 2];
                var a = imageData.data[i + 3];

                if (a > 0.5) {
                    if (r - g > 50 && r - b > 50) {
                        var h = this.playerNumber * 360;
                        var u = 1;
                        var e = 0.5;

                        var c = e * u;
                        var x = c * (1 - Math.abs((h / 60) % 2 - 1));
                        var m = e - c;

                        var rx;
                        var gx;
                        var bx;
                        if (h < 60) {
                            rx = c;
                            gx = x;
                            bx = 0;
                        } else if (h < 120) {
                            rx = x;
                            gx = c;
                            bx = 0;
                        } else if (h < 180) {
                            rx = 0;
                            gx = c;
                            bx = x;
                        } else if (h < 240) {
                            rx = 0;
                            gx = x;
                            bx = c;
                        } else if (h < 300) {
                            rx = x;
                            gx = 0;
                            bx = c;
                        } else {
                            rx = c;
                            gx = 0;
                            bx = x;
                        }
                        rx = (rx + m) * 255;
                        gx = (gx + m) * 255;
                        bx = (bx + m) * 255;

                        imageData.data[i] = rx;
                        imageData.data[i + 1] = gx;
                        imageData.data[i + 2] = bx;
                    }
                }
            }
            tempCtx.putImageData(imageData, 0, 0);

            this.playerImage.src = tempCanvas.toDataURL();
            this.playerImage.onload = () => { };
        }
        this.x = 0;
        this.y = 0;
        this.vy = 0;
        this.g = 3000;

        this.color = "hsl(" + playerNumber * 360 + ",100%, 30%)"
    }

    public update = (timeDiff: number) => {
        this.x = this.x + this.controller.xAxes * timeDiff * 500;
        if (this.controller.xAxes < 0) {
            this.moveLeft = true;
        } else if (this.controller.xAxes > 0) {
            this.moveLeft = false;
        }

        if (this.controller.yAxes < -0.5 && !this.isJumping) {
            console.log("jump");
            this.isJumping = true;
            this.vy = -2000;
            this.baseY = this.y;
        }

        this.y = this.y + this.vy * timeDiff;

        if (this.isJumping) {
            
            this.vy = this.vy + this.g * timeDiff;
            if (this.y > this.baseY) {
                this.vy = 0;
                this.y = this.baseY;
                this.isJumping = false;
                console.log("jumped");
            }
        }
    }

    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        // ctx.putImageData(this.imageDate, this.x, this.y);
        if (this.y == 0) {
            this.y = height - 20 - this.playerImage.height;
        }

        if (!this.moveLeft) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.playerImage, -this.x + -this.playerImage.naturalWidth, this.y);
            ctx.restore();
        } else {
            ctx.drawImage(this.playerImage, this.x, this.y);
        }
    }
}