import { View } from "./enc/view";
import { Controller, Signals } from "./enc/controller";
import { EEvent } from "./enc/eEvent";
import { Player } from "./player";
import treeImageAsset from "./assets/tree.png";
import { Tree } from "./tree";
import { BallSpawner } from "./ballSpawner";

export class GameView extends View {
    private allowNewGame: boolean;
    public requestNewGame: EEvent;
    currentTime: number;
    playTime: number;
    spawner: BallSpawner;
    player: Player[] = [];
    gameFinished: boolean;

    constructor(private controllers: Controller[]) {
        super("GameView");
        this.requestNewGame = new EEvent();
    }

    public start = () => {
        this.currentTime = 0;

        this.playTime = 5 * 60;

        this.addAnimation(this.introduction);

        this.addAnimation(this.animation);
        var tree = new Tree();
        this.addAnimatable(tree);
        this.spawner = new BallSpawner(2000 / this.controllers.length);
        this.addAnimatable(this.spawner);
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            var player = new Player(controller, i / this.controllers.length, this.spawner, tree);
            this.player.push(player);
            this.addAnimatable(player);
            
            controller.signal.addEventListener((sender: Controller, signal: Signals) => {
                if (this.gameFinished && this.allowNewGame) {
                    if (signal == Signals.a || signal == Signals.start) {
                        this.requestNewGame.dispatchEvent();
                    }
                }
            });
        }

        this.addUpdate(this.timerUpdate);
    }

    introduction = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        ctx.fillStyle = "black";
        ctx.font = "22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText('Grab some christmas balls with your hands', width * 1 / 4, height / 2);
        ctx.fillText('and put them on the tree.', width * 1 / 4, height / 2 + 30);
        ctx.font = "27px sans-serif";
        var secondsLeft = this.playTime - this.currentTime;
        if (secondsLeft < 0) {
            secondsLeft = 0;
        }
        ctx.fillText((Math.floor(secondsLeft / 60) + ":" + Math.round(secondsLeft % 60)).toString(), width * 1 / 4, height / 2 + 70);
    }

    private timerUpdate = (timeDiff: number) => {
        if (!this.gameFinished) {
            this.currentTime += timeDiff;
            if (this.currentTime >= this.playTime) {
                this.gameFinished = true;
                setTimeout(() => {
                    this.allowNewGame = true;
                }, 3000);
                this.removeAnimatable(this.spawner);
                this.removeAnimation(this.introduction);
                this.addAnimation((ctx, width, height) => {
                    if (this.allowNewGame) {
                        ctx.textAlign = "center"; // start / left / center / right / end
                        ctx.textBaseline = "top" // bottom / alphabetic / middle / hanging / top
                        ctx.fillStyle = "black"
                        ctx.font = "22px sans-serif";
                        ctx.fillText("Press a button to start a new game.", width * 1 / 4, height / 2)
                    }
                });
                this.player = this.player.sort((s1, s2) => {
                    return s2.points - s1.points;
                });

                for (let i = 0; i < this.player.length; i++) {
                    const player = this.player[i];
                    player.end(i + 1);
                }
            }
        }
    }

    public animation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, height, width, -30);
        ctx.fillStyle = "brown";
        ctx.fillRect(0, height - 30, width, -70);
    };
}