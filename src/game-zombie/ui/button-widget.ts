import { rectSprite } from "@core/utils";
import { EventEmitter } from "@elumixor/frontils";
import gsap from "gsap";
import { Container, Sprite, TextStyle, type ColorSource } from "pixi.js";
import { TextWidget } from "./text-widget";

export class ButtonWidget extends Container {
    readonly clicked = new EventEmitter();
    readonly textElement;

    private readonly container = new Container();

    private readonly interactiveElements = [this.container];
    constructor({
        width = 200,
        height = 50,
        sprite = undefined as Sprite | undefined,
        color = 0x335699 as ColorSource,
        borderColor = 0xffffff as ColorSource,
        borderWidth = 2,
        roundedRadius = 0,
        text = "",
        fit = true,
        textStyle = {} as Partial<TextStyle>,
    } = {}) {
        super();

        this.textElement = new TextWidget(text, textStyle);
        this.textElement.anchor.set(0.5);

        this.interactiveElements.push(this.textElement);

        if (sprite) {
            this.addChild(sprite);
            sprite.anchor.set(0.5);
            if (fit) this.textElement.fitTo(width, height);

            this.interactiveElements.push(sprite);
        } else {
            const background = this.addChild(
                rectSprite({
                    width: width + borderWidth * 2,
                    height: height + borderWidth * 2,
                    color: borderColor,
                    roundedRadius,
                }),
            );
            const foreground = this.addChild(rectSprite({ width, height, color, roundedRadius }));

            for (const element of [background, foreground]) element.anchor.set(0.5);

            this.interactiveElements.push(background, foreground);
        }

        this.container.addChild(this.textElement);

        this.addChild(this.container);

        this.disabled = false;

        for (const element of this.interactiveElements) element.on("pointerdown", () => this.clicked.emit());
    }

    get disabled() {
        return this.container.interactive;
    }
    set disabled(value) {
        for (const element of this.interactiveElements) {
            element.interactive = !value;
            element.cursor = value ? "default" : "pointer";
        }
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
