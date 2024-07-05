import { rectSprite } from "@core/pixi-utils";
import gsap from "gsap";
import { Container } from "pixi.js";

export class Bar extends Container {
    private _max;
    private _value;

    private readonly background;
    private readonly foreground;

    private readonly fullWidth;

    constructor({
        max,
        value,
        color,
        width = 100,
        height = 50,
    }: {
        max: number;
        value: number;
        color: number;
        width?: number;
        height?: number;
    }) {
        super();

        this._max = max;
        this._value = value;

        const padding = Math.min(width, height) * 0.1;

        this.background = rectSprite({ width, height, color: 0x000000 });
        this.fullWidth = width - padding * 2;
        this.foreground = rectSprite({ width: this.fullWidth, height: height - padding * 2, color });

        this.foreground.x = padding;
        this.foreground.y = padding;

        this.addChild(this.background, this.foreground);

        // Update instantly
        this.foreground.width = this.fullWidth * (this._value / this._max);
    }

    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        this.update();
    }

    get max() {
        return this._max;
    }
    set max(value) {
        this._max = value;
        this.update();
    }

    private update() {
        const target = this.fullWidth * (this._value / this._max);

        gsap.killTweensOf(this.foreground);
        gsap.to(this.foreground, { width: target, duration: 0.5 });

        gsap.killTweensOf(this.foreground.scale);
        gsap.to(this.scale, {
            x: 1.01,
            y: 1.01,
            duration: 0.1,
            onComplete: () => void gsap.to(this.scale, { x: 1, y: 1, duration: 0.1 }),
        });
    }
}
