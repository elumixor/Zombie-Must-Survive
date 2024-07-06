import { rectSprite } from "@core/pixi-utils";
import { EventEmitter } from "@elumixor/frontils";
import gsap from "gsap";
import { Container, TextStyle } from "pixi.js";
import { Text } from "./text";

export class Button extends Container {
    readonly clicked = new EventEmitter();

    private readonly container = new Container();
    private readonly textElement;

    constructor({
        width = 200,
        height = 50,
        color = 0x335699,
        borderColor = 0xffffff,
        borderWidth = 2,
        text = "",
        textStyle = {} as Partial<TextStyle>,
    } = {}) {
        super();

        const background = rectSprite({
            width: width + borderWidth * 2,
            height: height + borderWidth * 2,
            color: borderColor,
        });
        const foreground = rectSprite({ width, height, color });

        this.textElement = new Text(text, textStyle);

        for (const element of [background, foreground, this.textElement]) element.anchor.set(0.5);

        this.container.addChild(background, foreground, this.textElement);
        this.addChild(this.container);

        this.disabled = false;
        this.container.on("pointerdown", () => this.clicked.emit());
    }

    get disabled() {
        return this.container.interactive;
    }
    set disabled(value) {
        this.container.interactive = !value;
        this.container.cursor = value ? "default" : "pointer";
    }

    get text() {
        return this.textElement.text;
    }
    set text(value) {
        this.textElement.text = value;
    }

    show() {
        return gsap.fromTo(this.container, { alpha: 0, y: 20 }, { alpha: 1, y: 0, duration: 0.5 });
    }

    hide() {
        return gsap.to(this.container, { alpha: 0, y: 20, duration: 0.5 });
    }
}
