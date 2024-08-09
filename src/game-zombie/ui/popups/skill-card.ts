import { rectSprite } from "@core";
import { EventEmitter } from "@elumixor/frontils";
import type { Skill } from "game-zombie/skills";
import { Container, Sprite } from "pixi.js";
import { TextWidget } from "../text-widget";

export class SkillCard extends Container {
    readonly selected = new EventEmitter();

    readonly totalWidth = 220;
    private readonly totalHeight = 300;
    private readonly imageHeight = 40;

    private readonly padding = 20;
    private readonly borderWidth = 5;

    constructor(readonly skill: Skill) {
        super();

        const options = {
            wordWrap: true,
            wordWrapWidth: this.totalWidth - (this.padding + this.borderWidth) * 2,
        };

        const bg = rectSprite({ width: this.totalWidth, height: this.totalHeight, roundedRadius: 5 });
        const fg = rectSprite({
            width: this.totalWidth - this.borderWidth * 2,
            height: this.totalHeight - this.borderWidth * 2,
            color: "rgb(60, 24, 102)",
            roundedRadius: 5,
        });

        const title = new TextWidget(skill.name.toUpperCase(), { fontSize: 20, align: "center", ...options });

        const image = new Sprite(skill.texture);
        image.uniformHeight = this.imageHeight;

        const description = new TextWidget(skill.description, { fontSize: 12, align: "center", ...options });
        const diff = new TextWidget(skill.currentDiff, {
            fontSize: 12,
            letterSpacing: 0,
            lineHeight: 16,
            dropShadowDistance: 0,
            dropShadowBlur: 5,
            padding: 5,
            whiteSpace: "pre-line",
            ...options,
        });

        let y = -this.totalHeight / 2 + title.height / 2 + this.padding * 1.5 + this.borderWidth;
        title.y = y;
        y += title.height + 20;
        image.y = y;
        y += this.imageHeight + 20;
        description.y = y;
        y += description.height + 20;
        diff.y = y;
        diff.x = -this.totalWidth / 2 + this.padding + this.borderWidth;

        const elements = [bg, fg, image, title, description];

        for (const el of elements) el.anchor.set(0.5);
        this.addChild(...elements, diff);

        this.interactive = true;
        this.cursor = "pointer";
        this.on("pointerdown", () => this.selected.emit());
    }
}