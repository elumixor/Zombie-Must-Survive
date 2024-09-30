import { EventEmitter } from "@elumixor/frontils";
import type { Skill } from "game-zombie/skills";
import { Container, Sprite } from "pixi.js";
import { TextWidget } from "../text-widget";

const options = {
    align: "center",
    wordWrap: true,
    wordWrapWidth: 200,
} as const;

export class SpecialSkillCard extends Container {
    readonly selected = new EventEmitter();

    private readonly background = this.addChild(Sprite.from("ui-card-rare-bg"));
    private readonly card = this.addChild(Sprite.from("ui-card-rare"));
    private readonly ad = this.card.addChild(Sprite.from("ui-ad"));
    private readonly clip = this.card.addChild(Sprite.from("ui-clip"));
    private readonly title = this.card.addChild(new TextWidget("", { fontSize: 20, fill: "red", ...options }));
    private readonly diffBg = this.background.addChild(Sprite.from("ui-label-bg"));
    private readonly descriptionBg = this.background.addChild(Sprite.from("ui-label-bg"));
    private readonly description = this.descriptionBg.addChild(new TextWidget("", { fontSize: 12, ...options }));
    private readonly image;
    private readonly diff = this.diffBg.addChild(
        new TextWidget("", { fontSize: 12, ...options, align: "center", whiteSpace: "pre-line" }),
    );

    constructor(readonly skill: Skill) {
        super();

        this.name = `SkillCard (${skill.name})`;

        this.image = this.card.addChild(new Sprite(skill.texture));
        this.title.text = skill.name;
        this.description.text = skill.description;
        this.diff.text = skill.currentDiff;

        this.card.x = -this.background.width / 4;

        this.title.y = -this.card.height / 2 + 30;
        this.title.fitTo(150, 60);
        this.image.fitTo(120, 80, { scaleUp: false });

        this.image.y += 5;

        this.description.fitTo(200, 50, { scaleUp: false });
        this.diff.fitTo(200, 50, { scaleUp: false });

        this.clip.x = -this.card.width / 2;
        this.clip.y = -this.card.height / 2 + 10;
        this.clip.angle = 10;

        this.descriptionBg.y = -this.background.height / 5;
        this.diffBg.y = this.background.height / 5;

        this.descriptionBg.x = this.background.width / 6;
        this.diffBg.x = this.background.width / 6;

        // Add image on top of the stars
        this.card.addChild(this.image);

        for (const el of [
            this.background,
            this.card,
            this.ad,
            this.clip,
            this.image,
            this.title,
            this.descriptionBg,
            this.diffBg,
            this.description,
            this.diff,
        ])
            el.anchor.set(0.5);

        this.card.rotation = -0.1;

        this.ad.y = this.card.height / 2 - 15;

        this.interactive = true;
        this.cursor = "pointer";
        this.on("pointerdown", () => this.selected.emit());
    }

    get totalWidth() {
        return this.card.width;
    }
}
