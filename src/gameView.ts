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
        super();
        this.requestNewGame = new EEvent();
    }

    public start() {
        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];
            var snake = new Player(controller, i / this.controllers.length);
            this.addAnimatable(snake);
        }

        this.lastFrameTime = Date.now();
        this.addUpdate(this.update);
        this.addAnimation(this.animation);

        for (let i = 0; i < this.controllers.length; i++) {
            const controller = this.controllers[i];

            controller.signal.addEventListener((sender: Controller, signal: Signals) => {
                if (this.gameFinished && this.allowNewGame) {
                    if (signal == Signals.a || signal == Signals.start) {
                        this.requestNewGame.dispatchEvent();
                    }
                }
            });
        }
    }

    private snakeIsDone = () => {
        let snakesDone = this.snakes.map(s => {
            return s.isDone;
        })

        let snakesAlive = snakesDone.filter(s => !s).length;
        if (snakesAlive == 0) {
            this.gameFinishedMethod();
        }
    }

    private gameFinishedMethod = () => {
        this.gameFinished = true;
        setTimeout(() => {
            this.allowNewGame = true;
        }, 3000);
        this.snakes = this.snakes.sort((s1, s2) => {
            return s2.points - s1.points;
        });
        this.addAnimation((ctx: CanvasRenderingContext2D, width: number, height: number) => {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < this.snakes.length; i++) {
                const snake = this.snakes[i];
                ctx.textAlign = "center"; // start / left / center / right / end
                ctx.textBaseline = "top" // bottom / alphabetic / middle / hanging / top
                ctx.fillStyle = "hsl(" + snake.playerNumber * 360 + ",100%, 50%)"
                var x = width * snake.playerNumber + width * (1 / this.snakes.length) / 2;
                if (snake.isDone) {
                    let newWidth = width / this.snakes.length / 4;
                    let newHeight = newWidth / this.deathImage.naturalWidth * this.deathImage.naturalHeight;
                    ctx.drawImage(this.deathImage, x - newWidth / 2, height / 2 - 80 - newHeight - 20, newWidth, newHeight);
                }
                ctx.font = "50px sans-serif";
                ctx.fillText("Score: " + snake.points.toString(), x, height / 2 - 80)
                ctx.font = (60 + (this.snakes.length - i) * 20) + "px sans-serif";

                ctx.fillStyle = "hsl(" + snake.playerNumber * 360 + ",100%, 50%)"
                ctx.fillText((i + 1).toString() + ".", x, height / 2)
            }

            if (this.allowNewGame) {
                ctx.textAlign = "center"; // start / left / center / right / end
                ctx.textBaseline = "top" // bottom / alphabetic / middle / hanging / top
                ctx.fillStyle = "black"
                ctx.font = "50px sans-serif";
                ctx.fillText("Press a button to start a new game.", width / 2, height / 4 * 3)
            }
        })

    }

    public update = (timeDiff: number) => {
        if (this.gameFinished) {
            return;
        }
        var now = Date.now();
        var elapsed = now - this.lastFrameTime;

        if (elapsed > this.fpsInterval) {
            this.lastFrameTime = now;

            if (this.items.length < this.maxItems) {
                if (this.currentItemSpawnDelay == 0) {
                    this.currentItemSpawnDelay = this.itemSpawnerDelay;
                    let foundItem = true;
                    let maxIterations = 20;
                    do {
                        foundItem = true;
                        let itemX = Math.floor(Math.random() * this.numberOfBlocksX);
                        let itemY = Math.floor(Math.random() * this.numberOfBlocksY);

                        for (let i = 0; i < this.snakes.length && foundItem; i++) {
                            const snake = this.snakes[i];
                            for (let j = 0; j < snake.parts.length && foundItem; j++) {
                                const part = snake.parts[j];
                                if (part.x == itemX && part.y == itemY) {
                                    foundItem = false;
                                }
                            }
                        }
                        maxIterations--;
                        if (foundItem) {
                            this.items.push({ x: itemX, y: itemY, weight: (Math.floor(Math.random() * 2) + 1) / 2, drawStart: Math.random() * Math.PI * 2 });
                        }
                    } while (!foundItem && maxIterations > 0);
                }
                else {
                    this.currentItemSpawnDelay--;
                }
            }

            for (let i = 0; i < this.snakes.length; i++) {
                const snake = this.snakes[i];
                snake.tick();
            }
            for (let i = 0; i < this.snakes.length; i++) {
                const snake1 = this.snakes[i];
                if (!snake1.isDone) {
                    if (snake1.headPart.x < 0 || snake1.headPart.y < 0 || snake1.headPart.x >= this.numberOfBlocksX || snake1.headPart.y >= this.numberOfBlocksY) {
                        snake1.iMDone.dispatchEvent();
                    }
                    for (let j = 0; j < this.snakes.length; j++) {
                        const snake2 = this.snakes[j];
                        let length = snake1 != snake2 ? snake2.parts.length : snake2.parts.length - 1;
                        for (let k = 0; k < length; k++) {
                            const part = snake2.parts[k];
                            if (part.x == snake1.headPart.x && part.y == snake1.headPart.y) {
                                snake1.iMDone.dispatchEvent();
                            }
                        }
                    }
                    var collectedItemIndices = [];
                    for (let j = 0; j < this.items.length; j++) {
                        const item = this.items[j];
                        if (item.x == snake1.headPart.x && item.y == snake1.headPart.y) {
                            collectedItemIndices.push(j);
                            snake1.collected.dispatchEvent(item.weight);
                        }
                    }
                    for (let i = 0; i < collectedItemIndices.length; i++) {
                        const itemIndex = collectedItemIndices[i];
                        this.items.splice(itemIndex, 1);
                    }
                }
            }

            var isFirst = true;
            let snakesAlive = this.snakes.filter(s => !s.isDone);

            if (snakesAlive.length == 1 && this.snakes.length > 1) {
                for (let i = 0; i < this.snakes.length; i++) {
                    const snake2 = this.snakes[i];
                    if (snake2 != snakesAlive[0]) {

                        if (snake2.points >= snakesAlive[0].points) {
                            isFirst = false;
                        }
                    }
                }
                if (isFirst) {
                    this.gameFinishedMethod();
                }
            }
        }
    };

    public animation = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        let fieldSizeX = width / this.numberOfBlocksX;
        const fieldSizeY = height / this.numberOfBlocksY;

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(item.x * fieldSizeX + fieldSizeX / 2, item.y * fieldSizeY + fieldSizeY / 2, fieldSizeX / 3, item.drawStart, item.drawStart + Math.PI * 2 * item.weight);
            ctx.fill();
        }

        this.numberOfBlocksX = (this.fieldSize * 30)
        fieldSizeX = width / this.numberOfBlocksX;
        this.numberOfBlocksY = Math.ceil(height / fieldSizeX);
    };
}