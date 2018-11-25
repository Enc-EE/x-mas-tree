import { Animatable } from "./enc/animation";
import { Controller, Signals } from "./enc/controller";
import { EEvent, EEventT } from "./enc/eEvent";

enum Direction {
    up,
    right,
    down,
    left
}

export class Snake implements Animatable {

    public parts: { x: number, y: number }[] = [];
    public points: number;

    private direction: Direction;
    private nextDirection: Direction
    private color: string;
    public iMDone: EEvent;
    public collected: EEventT<number>;
    public isDone: boolean;
    private addPart: boolean;

    public get headPart(): { x: number, y: number } {
        return this.parts[this.parts.length - 1];
    }



    constructor(private fieldSize: number, private controller: Controller, public playerNumber: number) {
        this.direction = Direction.right;
        this.points = 0;
        this.nextDirection = this.direction;
        this.isDone = false;
        this.color = "hsl(" + playerNumber * 360 + ",100%, 30%)"
        for (let i = 0; i < 7; i++) {
            this.parts.push({ x: 3 + i, y: 1 + Math.round(playerNumber * 20) });
        }
        controller.signal.addEventListener(this.controllerSignal)

        this.iMDone = new EEvent();
        this.collected = new EEventT<number>();
        this.collected.addEventListener(this.collectedSomething);
        this.iMDone.addEventListener(this.finish)
    }


    private collectedSomething = (weight: number) => {
        this.points += weight * 2;
        this.addPart = true;
    };

    private finish = () => {
        this.isDone = true;
        this.points = this.points - 8;
    }

    private controllerSignal = (sender: Controller, signal: Signals) => {
        switch (signal) {
            case Signals.up:
                if (this.direction != Direction.down) {
                    this.nextDirection = Direction.up;
                }
                break;
            case Signals.right:
                if (this.direction != Direction.left) {
                    this.nextDirection = Direction.right;
                }
                break;
            case Signals.down:
                if (this.direction != Direction.up) {
                    this.nextDirection = Direction.down;
                }
                break;
            case Signals.left:
                if (this.direction != Direction.right) {
                    this.nextDirection = Direction.left;
                }
                break;
        }
    }

    public tick = () => {
        if (!this.isDone) {
            this.direction = this.nextDirection;
            const current = this.parts[this.parts.length - 1]
            switch (this.direction) {
                case Direction.up:
                    this.parts.push({ x: current.x, y: current.y - 1 })
                    break;
                case Direction.right:
                    this.parts.push({ x: current.x + 1, y: current.y })
                    break;
                case Direction.down:
                    this.parts.push({ x: current.x, y: current.y + 1 })
                    break;
                case Direction.left:
                    this.parts.push({ x: current.x - 1, y: current.y })
                    break;
            }
            if (!this.addPart) {
                this.parts.shift();
            } else {
                this.addPart = false;
            }
        }
    }

    public update = (timeDiff: number) => {
    }

    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        const numberOfBlocksX = (this.fieldSize * 30)
        const fieldSizeX = width / numberOfBlocksX;
        let numberOfBlocksY = height / fieldSizeX;
        numberOfBlocksY = Math.ceil(numberOfBlocksY)
        const fieldSizeY = height / numberOfBlocksY;

        var colorGradient = 30 / this.parts.length;
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.parts.length; i++) {
            if (this.isDone) {
                ctx.fillStyle = "hsl(" + this.playerNumber * 360 + ",100%, 30%)"
            } else {
                ctx.fillStyle = "hsl(" + this.playerNumber * 360 + ",100%, " + (30 + colorGradient * i) + "%)"
            }
            const part = this.parts[i];
            ctx.fillRect(part.x * fieldSizeX, part.y * fieldSizeY, fieldSizeX, fieldSizeY);
        }

        ctx.textAlign = "start"; // start / left / center / right / end
        ctx.textBaseline = "top" // bottom / alphabetic / middle / hanging / top
        ctx.font = "60px sans-serif";
        ctx.fillStyle = "hsl(" + this.playerNumber * 360 + ",100%, 50%)"
        ctx.fillText(this.points.toString(), width * this.playerNumber, 10)
    }
}