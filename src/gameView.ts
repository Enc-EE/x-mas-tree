import { View } from "./enc/view";
import { Controller, Signals } from "./enc/controller";
import { Snake } from "./snake";
import death from "./assets/skull-and-crossbones.png";
import { EEvent } from "./enc/eEvent";
import { Player } from "./player";

export class GameView extends View {
    private allowNewGame: boolean;
    public requestNewGame: EEvent;

    constructor(private controllers: Controller[]) {
        super("GameView");
        this.requestNewGame = new EEvent();
    }

    public start = () => {
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            var player = new Player(controller, i / this.controllers.length);
            console.log("hi");
            
            this.addAnimatable(player);
        }

        // this.addUpdate(this.update);
        this.addAnimation(this.animation);
    }

    // public update = (timeDiff: number) => {
    //     console.log("hallo");
        
    // };

    public animation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, height, width, -20);
    };
}