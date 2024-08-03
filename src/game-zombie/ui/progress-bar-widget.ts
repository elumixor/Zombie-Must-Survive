import { rectSprite } from "@core/utils";
import gsap from "gsap";
import { Container, type ColorSource } from "pixi.js";
import { TextWidget } from "./text-widget";

export class ProgressBarWidget extends Container {
    private _max;
    private _value;

    private readonly background;
    private readonly foreground;

    private readonly fullWidth;

    private readonly textElement = new TextWidget("", {
        fontSize: 20,
        letterSpacing: 0,
    });

    constructor({
        max,
        value,
        color,
        width = 100,
        height = 50,
    }: {
        max: number;
        value: number;
        color: ColorSource;
        width?: number;
        height?: number;
    }) {
        super();

        this._max = max;
        this._value = value;

        const padding = min(width, height) * 0.1;

        this.background = rectSprite({ width, height, color: 0x000000 });
        this.fullWidth = width - padding * 2;
        this.foreground = rectSprite({ width: this.fullWidth, height: height - padding * 2, color });

        this.foreground.x = padding;
        this.foreground.y = padding;

        this.textElement.anchor.set(1, 0.5);
        this.textElement.resolution = 2;
        this.textElement.x = width - padding * 2;
        this.textElement.y = height / 2;

        this.addChild(this.background, this.foreground, this.textElement);

        // Update instantly
        this.foreground.width = this.fullWidth * (this._value / this._max);
        this.textElement.text = `${this._value} / ${this._max}`;
        this.textElement.uniformHeight = this.background.height * 2;
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

        this.textElement.text = `${this._value} / ${this._max}`;

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
