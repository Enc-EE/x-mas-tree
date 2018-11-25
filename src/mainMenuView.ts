import { View } from "./enc/view";
import { Controller, Signals, ControllerType } from "./enc/controller";
import { KeyboardControls } from "./enc/keyboardControls";
import { GamepadScanner } from "./enc/gamepadScanner";
import { GamepadControls } from "./enc/gamepadControls";
import controls_gamepad from "./assets/controls_gamepad.png";
import controls_keyboard from "./assets/controls_keyboard.png";
import { EEvent } from "./enc/eEvent";
import { WebRtcConnector } from "./enc/webRtcConnector";

export class MainMenuView extends View {
    private selectedOption: number;
    private options: string[] = [];
    public controllers: Controller[] = [];
    controls_gamepad_image: HTMLImageElement;
    controls_keyboard_image: HTMLImageElement;

    private showControls: boolean;
    gamepadScanner: GamepadScanner;

    public requestStart: EEvent;

    constructor() {
        super("MenuView");
        this.requestStart = new EEvent();
        this.options = ["Start Game", "Show / Hide Controls"];
        this.selectedOption = 0;
        this.showControls = true;

        this.controls_gamepad_image = new Image();
        this.controls_gamepad_image.src = controls_gamepad;
        this.controls_keyboard_image = new Image();
        this.controls_keyboard_image.src = controls_keyboard;

        this.addAnimation((ctx: CanvasRenderingContext2D, width: number, height: number) => {
            if (this.showControls) {
                let newWidth = width / 3;
                let newHeight = newWidth / this.controls_gamepad_image.naturalWidth * this.controls_gamepad_image.naturalHeight;
                ctx.drawImage(this.controls_gamepad_image, newWidth - newWidth / 2, height * 3 / 4 - newHeight / 2, newWidth, newHeight);
                newHeight = newWidth / this.controls_keyboard_image.naturalWidth * this.controls_keyboard_image.naturalHeight;
                ctx.drawImage(this.controls_keyboard_image, newWidth * 2 - newWidth / 2, height * 3 / 4 - newHeight / 2, newWidth, newHeight);
            }
        });

        this.addAnimation(this.drawOptions);
        this.addAnimation(this.drawControllers);

        this.gamepadScanner = new GamepadScanner();
        this.gamepadScanner.scannedGamepad.addEventListener((gamepad: Gamepad) => {
            this.addController(new GamepadControls(gamepad.index.toString(), gamepad.index));
        });
        this.gamepadScanner.start();

        var rtc = new WebRtcConnector();

        var keyboard = new KeyboardControls("arrows", 38, 37, 40, 39, 32);
        this.addController(keyboard);
    }

    public drawOptions = (ctx: CanvasRenderingContext2D, width: number, height: number) => {

        if (this.controllers.length <= 0) {
            return;
        }
        const fontSize = 22;
        const margin = 5;
        const optionsHeight = (fontSize + margin * 2) * this.options.length;
        const startHeight = height / 2 - optionsHeight / 2;
        for (let i = 0; i < this.options.length; i++) {
            const option = this.options[i];

            ctx.fillStyle = "black";
            ctx.textAlign = "center"; // start / left / center / right / end
            ctx.textBaseline = "middle" // bottom / alphabetic / middle / hanging / top
            ctx.font = "22px sans-serif";
            const optionHeight = startHeight + margin + (fontSize + margin * 2) * i;
            ctx.fillText(option, width / 2, optionHeight);

            if (i === this.selectedOption) {
                ctx.strokeRect(width / 2 - ctx.measureText(option).width / 2 - margin, optionHeight - fontSize / 2 - margin, ctx.measureText(option).width + margin * 2, fontSize + margin * 2);
            }
        }
    }

    public drawControllers = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        var margin = 15;
        var controllerWidth = 60;
        var totalWidth = margin + this.controllers.length * (controllerWidth + margin)
        var startX = width / 2 - totalWidth / 2
        for (let i = 0; i < this.controllers.length; i++) {
            ctx.fillStyle = "hsl(" + i / this.controllers.length * 360 + ",100%, 40%)";
            const element = this.controllers[i];
            var x = startX + margin + (margin + controllerWidth) * i;
            switch (element.type) {
                case ControllerType.gamepad:
                    ctx.font = '60px FontAwesome';
                    ctx.fillText('\uf11b', x, height / 4);
                    break;
                case ControllerType.keyboard:
                    ctx.font = '60px FontAwesome';
                    ctx.fillText('\uf11c', x, height / 4);
                    break;
                default:
                    break;
            }
        }
    }

    private addController = (controller: Controller) => {
        if (controller.type == ControllerType.gamepad) {
            (<GamepadControls>controller).enableSignals();
        }
        controller.signal.addEventListener(this.controllerSignal)
    }

    private controllerSignal = (sender: Controller, signal: Signals) => {
        if (signal == Signals.start) {
            if (this.controllers.indexOf(sender) >= 0) {
                this.controllers.splice(this.controllers.indexOf(sender), 1);
            } else {
                this.controllers.push(sender);
            }
        } else if (this.controllers.length > 0 && this.controllers[0] == sender) {
            switch (signal) {
                case Signals.down:
                    this.selectedOption++;
                    if (this.selectedOption >= this.options.length) {
                        this.selectedOption = 0;
                    }
                    break;
                case Signals.up:
                    this.selectedOption--;
                    if (this.selectedOption < 0) {
                        this.selectedOption = this.options.length - 1;
                    }
                    break;
                case Signals.a:
                    switch (this.selectedOption) {
                        case 0:
                            this.gamepadScanner.stop();
                            this.requestStart.dispatchEvent();
                            break;
                        case 1:
                            this.showControls = !this.showControls;
                            break;
                    }
                    break;
            }
        }
    }
}