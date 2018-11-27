import { Animatable } from "./enc/animation";
import { Controller, Signals } from "./enc/controller";
import playerImageAsset from "./assets/ball.png";
import { Helper } from "./enc/helper";
import { Ball } from "./ball";
import { AnimationTicker } from "./enc/animationTicker";
import { Rectangle } from "./enc/rectangle";

export class BallSpawner implements Animatable {

    private rate = 20;
    private balls: Ball[] = [];
    ticker: AnimationTicker;

    constructor() {
        this.ticker = new AnimationTicker(3000, this.spawnBall);
    }

    public getBall = (rectangle: Rectangle): Ball => {
        var ballIndex = -1;
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            if (ball.getHitRect().collidesWith(rectangle)) {
                ballIndex = i;
            }
        }
        if (ballIndex >= 0) {
            var ball = this.balls[ballIndex];
            this.balls.splice(ballIndex, 1);
            return ball;
        }
    }

    private spawnBall = () => {
        var ball = new Ball();
        ball.x = Math.random() * 600 + 100;
        ball.y = -100;
        this.balls.push(ball);
    }

    public update = (timeDiff: number) => {
        this.ticker.update(timeDiff);
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            ball.y = ball.y + 30 * timeDiff;
        }
    }

    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        var removeIndices: number[] = [];
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            ball.draw(ctx);
            if (ball.y > height + 100) {
                removeIndices.push(i);
            }
        }

        for (let i = 0; i < removeIndices.length; i++) {
            const index = removeIndices[i];
            this.balls.splice(index, 1);
        }
    }
}