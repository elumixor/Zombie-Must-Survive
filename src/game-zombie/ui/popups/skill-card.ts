import { EventEmitter } from "@elumixor/frontils";
import type { Skill } from "game-zombie/skills";
import { Container, Sprite } from "pixi.js";
import { TextWidget } from "../text-widget";

const options = {
    align: "center",
    wordWrap: true,
    wordWrapWidth: 200,
} as const;

export class SkillCard extends Container {
    readonly selected = new EventEmitter();

    private readonly bg;
    private readonly title;
    private readonly description;
    private readonly image;

    constructor(
        readonly skill: Skill,
        special = false,
    ) {
        super();

        this.name = `SkillCard (${skill.name})`;

        this.bg = this.addChild(Sprite.from(special ? "ui-card-rare" : "ui-card"));
        this.title = this.addChild(new TextWidget("", { fontSize: 20, ...options }));
        this.description = this.addChild(new TextWidget("", { fontSize: 12, ...options }));

        this.image = new Sprite(skill.texture);
        this.title.text = skill.name;
        this.description.text = skill.description;

        this.title.y = -90;
        this.title.fitTo(120, 40, { scaleUp: false });
        this.image.fitTo(120, 80, { scaleUp: false });

        this.image.y = -15;

        this.description.fitTo(160, 40);
        this.description.y = 45;

        const starsContainer = this.addChild(new Container());

        const starsWidth = 140;
        const step = starsWidth / 5;

        for (const i of range(5)) {
            const starName = i >= skill.level ? "ui-star-disabled" : "ui-star-enabled";
            const star = starsContainer.addChild(Sprite.from(starName));
            star.anchor.set(0.5);
            star.x = -starsWidth / 2 + step * i + step / 2;
        }

        starsContainer.y = 90;

        // Add image on top of the stars
        this.addChild(this.image);

        for (const el of [this.bg, this.image, this.title, this.description]) el.anchor.set(0.5);

        this.interactive = true;
        this.cursor = "pointer";
        this.on("pointerdown", () => this.selected.emit());
    }

    get totalWidth() {
        return this.bg.width;
    }
}
