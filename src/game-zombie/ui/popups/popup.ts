import { responsive, Actor, type IResizeObservable, rectSprite, type IDimensions } from "@core";
import { all } from "@elumixor/frontils";
import { Container } from "pixi.js";
import { gsap } from "gsap";

@responsive
export class Popup extends Actor implements IResizeObservable {
    protected readonly overlay = this.addChild(rectSprite({ alpha: 0.9, color: "black" }));

    @responsive({ pin: 0.5 })
    protected readonly container = this.addChild(new Container());

    constructor() {
        super();

        this.layer = "popup";
        this.overlay.alpha = 0;
        this.container.alpha = 0;
        this.interactiveChildren = false;
    }

    resize({ width, height }: IDimensions) {
        this.overlay.width = width;
        this.overlay.height = height;
    }

    show(): PromiseLike<unknown>;
    async show() {
        this.interactiveChildren = true;
        this.container.alpha = 1;
        await gsap.fromTo(this.overlay, { alpha: 0 }, { alpha: 1, duration: 0.5 });
    }

    async hide() {
        await all(
            gsap.to(this.overlay, { alpha: 0, duration: 0.5 }),
            gsap.to(this.container, { alpha: 0, duration: 0.5 }),
        );
    }
}
