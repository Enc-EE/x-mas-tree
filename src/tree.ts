import { Animatable } from "./enc/animation";
import { Controller, Signals } from "./enc/controller";
import treeImageAsset from "./assets/tree.png";
import { Helper } from "./enc/helper";
import { Ball } from "./ball";
import { Rectangle } from "./enc/rectangle";

export class Tree implements Animatable {
    private treeImage: HTMLImageElement;
    private x: number;
    private y: number;
    color: string;
    balls: Ball[] = [];
    treeImageData: ImageData;
    recalculate: boolean;
    width: number;
    height: number;
    private pointsLines = [0.0, 0.3, 0.5, 0.7, 0.8, 0.9];

    constructor() {
        this.treeImage = new Image();
        this.treeImage.src = treeImageAsset;
        this.recalculate = true;

        this.x = 0;
        this.y = 0;
    }

    public update = (timeDiff: number) => {
    }

    public addBall = (ball: Ball): number => {
        if (ball.getHitRect().collidesWith(new Rectangle(this.x, this.y, this.width, this.height))) {
            var x = Math.round((ball.x - this.x) / this.width * this.treeImageData.width);
            var y = Math.round((ball.y - this.y) / this.height * this.treeImageData.height);
    
            let isBallOnTree = this.isPointOnTree(y, x);
            if (isBallOnTree) {
                this.balls.push(ball);

                let pointsY = 1 - (ball.y - this.y) / this.height;
                
                for (let i = 0; i < this.pointsLines.length - 1; i++) {
                    const pointsLine = this.pointsLines[i];
                    if (pointsY < this.pointsLines[i + 1]) {
                        return i + 1;
                    }
                }
                return this.pointsLines.length
            }
        }

        return 0;
    }

    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        if (this.recalculate) {
            let newHeight = height * 3 / 4;
            let newWidth = newHeight / this.treeImage.naturalWidth * this.treeImage.naturalHeight;
            this.x = width - newWidth;
            this.y = height - newHeight - 20;
            this.width = newWidth;
            this.height = newHeight;
            Helper.getImageData(this.treeImage, (imageData) => this.treeImageData = imageData);
        }


        for (let i = 0; i < this.pointsLines.length; i++) {
            const pointLine = 1 - this.pointsLines[i];
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height * pointLine);
            ctx.lineTo(this.x + this.width, this.y + this.height * pointLine);

            ctx.strokeStyle = "black";
            ctx.stroke();

            ctx.fillStyle = "black";
            ctx.textBaseline = "bottom";
            ctx.textAlign = "right";
            ctx.font = "60px sans-serif";
            ctx.fillText((i + 1).toString(), this.x + this.width, this.y + this.height * pointLine);
        }

        ctx.drawImage(this.treeImage, this.x, this.y, this.width, this.height);
        this.balls.forEach(ball => {
            ball.draw(ctx);
        });
    }

    public isPointOnTree(y: number, x: number) {
        if (this.treeImageData) {
            for (let ys = y - 5; ys < y + 5; ys++) {
                for (let xs = x - 5; xs < x + 5; xs++) {
                    var a = this.treeImageData.data[xs * 4 + ys * 4 * this.treeImageData.width + 3];
                    if (a > 0.5) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}