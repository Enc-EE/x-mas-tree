import { AnimationFunction, UpdateFunction, Animatable, Animation } from "./animation";

export class View implements Animatable {
    public animations: AnimationFunction[] = [];
    public updates: UpdateFunction[] = [];
    private isVisible = true;

    public width: number;
    public height: number;

    public update = (timeDiff: number) => {
        if (this.isVisible) {
            for (const update of this.updates) {
                update(timeDiff);
            }
        }
    }
    public draw = (ctx: CanvasRenderingContext2D, width?: number, height?: number) => {
        if (this.isVisible) {
            for (const animate of this.animations) {
                animate(ctx, width, height);
            }
        }
    }

    public show = () => {
        this.isVisible = true;
    }

    public hide = () => {
        this.isVisible = false;
    }

    public addAnimation = (func: AnimationFunction) => {
        this.animations.push(func);
    }

    public removeAnimation = (func: AnimationFunction) => {
        this.animations.splice(this.animations.indexOf(func), 1);
    }

    public addUpdate = (func: UpdateFunction) => {
        this.updates.push(func);
    }

    public removeUpdate = (func: UpdateFunction) => {
        this.updates.splice(this.updates.indexOf(func), 1);
    }

    public addAnimatable = (animatable: Animatable) => {
        this.updates.push(animatable.update);
        this.animations.push(animatable.draw);
    }

    public removeAnimatable = (animatable: Animatable) => {
        this.updates.splice(this.updates.indexOf(animatable.update), 1);
        this.animations.splice(this.animations.indexOf(animatable.draw), 1);
    }
}