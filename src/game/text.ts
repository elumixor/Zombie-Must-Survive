import { Text as PixiText, TextStyle } from "pixi.js";
import { EventEmitter } from "@elumixor/frontils";

export class Text extends PixiText {
    readonly pressed = new EventEmitter();

    constructor(text: string, style: Partial<TextStyle> = {}) {
        super(text, {
            fontSize: 16,
            letterSpacing: 2,
            fill: 0xffffff,
            stroke: 0x000000,
            strokeThickness: 2,
            fontWeight: "bold",
            dropShadow: true,
            dropShadowColor: 0x000000,
            dropShadowDistance: 2,
            dropShadowAngle: Math.PI / 2,
            ...style,
        });

        this.resolution = 2;
    }

    override set interactive(value: boolean) {
        super.interactive = value;

        if (value) this.on("pointerdown", this.onPress);
        else this.off("pointerdown", this.onPress);
    }

    private readonly onPress = () => this.pressed.emit();
}
