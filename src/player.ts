import { Animatable } from "./enc/animation";
import { Controller, Signals } from "./enc/controller";
import playerImageAsset from "./assets/player.png";
import { Helper } from "./enc/helper";
import { Ball } from "./ball";
import { BallSpawner } from "./ballSpawner";
import { Rectangle } from "./enc/rectangle";
import { Tree } from "./tree";

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

    ballLeft: Ball;
    ballRight: Ball;
    position: any;

    constructor(private controller: Controller, public playerNumber: number, private ballSpawner: BallSpawner, private tree: Tree) {
        this.playerImage = new Image();
        this.playerImage.src = playerImageAsset;
        Helper.colorImage(this.playerImage, this.playerNumber * 360);
        this.x = 0;
        this.y = 0;
        this.vy = 0;
        this.g = 3000 / 969 * window.innerHeight;
        this.isJumping = false;
        this.ballLeft = null;
        this.ballRight = null;
        controller.signal.addEventListener(this.controllerSignal)


        this.color = "hsl(" + playerNumber * 360 + ",100%, 30%)"
    }

    public points = 0;

    private controllerSignal = (sender: Controller, signal: Signals) => {
        if (!this.position) {
            switch (signal) {
                case Signals.up:
                    if (!this.isJumping) {
                        this.isJumping = true;
                        console.log(new Date().toISOString() + ': ' + this.y);

                        this.vy = -2000 / 969 * window.innerHeight;
                        this.baseY = this.y;
                    }
                    break;
                case Signals.a:
                    if (this.ballLeft == null) {
                        var leftBall = this.ballSpawner.getBall(this.getLeftHandHitRect());
                        if (leftBall) {
                            leftBall.color(this.playerNumber);
                            this.ballLeft = leftBall;
                        }
                    } else {
                        var points = this.tree.addBall(this.ballLeft);

                        if (points > 0) {
                            this.points += points;
                            this.ballLeft = null;
                        }
                    }
                    if (this.ballRight == null) {
                        var rightBall = this.ballSpawner.getBall(this.getRightHandHitRect());
                        if (rightBall) {
                            rightBall.color(this.playerNumber);
                            this.ballRight = rightBall;
                        }
                    } else {
                        var points = this.tree.addBall(this.ballRight);

                        if (points > 0) {
                            this.points += points;
                            this.ballRight = null;
                        }
                    }
                    break;
            }
        }
    }

    private leftHandOffset = 5;
    private rightHandOffset = 120;
    private topHandOffset = 140
    private handSize = 25;

    private getLeftHandHitRect = () => {
        return new Rectangle(this.x + this.leftHandOffset, this.y + this.topHandOffset, this.handSize, this.handSize);
    }

    private getRightHandHitRect = () => {
        return new Rectangle(this.x + this.rightHandOffset, this.y + this.topHandOffset, this.handSize, this.handSize);
    }

    public update = (timeDiff: number) => {
        if (!this.position) {
            this.x = this.x + this.controller.xAxes * timeDiff * 500 * 2;
            if (this.controller.xAxes < 0) {
                this.moveLeft = true;
            } else if (this.controller.xAxes > 0) {
                this.moveLeft = false;
            }
        }

        this.y = this.y + this.vy * timeDiff;

        if (this.isJumping) {

            if (this.vy <= 0 && this.vy + this.g * timeDiff >= 0) {
                
                console.log(new Date().toISOString() + ': ' + this.y);
            }
            this.vy = this.vy + this.g * timeDiff;
            if (this.y > this.baseY) {
                this.vy = 0;
                this.y = this.baseY;
                console.log(new Date().toISOString() + ': ' + this.y);
                this.isJumping = false;
            }
        }

        if (this.ballLeft) {
            this.ballLeft.x = this.x + this.leftHandOffset + this.handSize / 2;
            this.ballLeft.y = this.y + this.topHandOffset - this.handSize;
        }

        if (this.ballRight) {
            this.ballRight.x = this.x + this.rightHandOffset + this.handSize / 2;
            this.ballRight.y = this.y + this.topHandOffset - this.handSize;
        }
    }

    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        if (this.y == 0 && this.playerImage.naturalHeight) {
            this.y = height - 40 - this.playerImage.naturalHeight;
        }

        if (!this.moveLeft) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(this.playerImage, -this.x + -this.playerImage.naturalWidth, this.y);
            ctx.restore();
        } else {
            ctx.drawImage(this.playerImage, this.x, this.y);
        }

        if (this.ballLeft) {
            this.ballLeft.draw(ctx, width, height);
        }

        if (this.ballRight) {
            this.ballRight.draw(ctx, width, height);
        }

        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        ctx.fillStyle = this.color;
        ctx.font = "60px sans-serif";
        ctx.fillText(this.points.toString(), 0, height * this.playerNumber);

        if (this.position) {
            ctx.font = (80 - this.position * 7) + "px sans-serif";
            ctx.fillText(this.position + ".", 150, height * this.playerNumber);
        }
    }

    public end = (position: number) => {
        this.position = position;
    }
}