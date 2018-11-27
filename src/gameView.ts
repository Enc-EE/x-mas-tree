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

    constructor(private controllers: Controller[]) {
        super("GameView");
        this.requestNewGame = new EEvent();
    }

    public start = () => {
        this.addAnimation(this.animation);
        var tree = new Tree();
        this.addAnimatable(tree);
        var spawner = new BallSpawner();
        this.addAnimatable(spawner);
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            var player = new Player(controller, i / this.controllers.length, spawner, tree);

            this.addAnimatable(player);
        }

        // this.addUpdate(this.update);
    }

    // public update = (timeDiff: number) => {
    //     console.log("hallo");

    // };

    public animation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, height, width, -30);
        ctx.fillStyle = "brown";
        ctx.fillRect(0, height - 30, width, -70);
    };
}