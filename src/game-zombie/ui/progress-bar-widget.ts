import { rectSprite } from "@core/utils";
import gsap from "gsap";
import { Container, type ColorSource } from "pixi.js";
import { TextWidget } from "./text-widget";

export class ProgressBarWidget extends Container {
    private _max;
    private _value;

    private readonly border;
    private readonly background;
    private readonly foreground;

    private readonly textElement = new TextWidget("", {
        fontSize: 20,
        letterSpacing: 0,
    });

    constructor({
        max = 100,
        value = 100,
        color: {
            fill = "green" as ColorSource,
            background = "grey" as ColorSource,
            border = "black" as ColorSource,
        } = {},
        border: { radius: roundedRadius = 0, size: borderSize = 0 } = {},
        width = 100,
        height = 50,
    } = {}) {
        super();

        this._max = max;
        this._value = value;

        this.border = this.addChild(
            rectSprite({
                width: width + borderSize * 2,
                height: height + borderSize * 2,
                color: border,
                roundedRadius,
            }),
        );
        this.background = this.addChild(rectSprite({ width, height, color: background, roundedRadius }));
        this.foreground = this.addChild(rectSprite({ width, height, color: fill, roundedRadius }));

        this.foreground.x = borderSize;
        this.background.x = borderSize;

        for (const el of [this.border, this.background, this.foreground]) el.anchor.set(0, 0.5);

        this.addChild(this.textElement);

        // Update instantly
        this.foreground.width = width * (this._value / this._max);
        this.textElement.text = `${this._value} / ${this._max}`;
        this.textElement.uniformHeight = this.border.height;
        this.textElement.anchor.set(1, 0.5);
        this.textElement.x = width - borderSize;
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
        const target = this.background.width * (this._value / this._max);

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
