import { inject } from "@core/di";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { EventEmitter } from "@elumixor/frontils";
import { Skill, SkillPool } from "game/skills";
import { Container, Sprite } from "pixi.js";
import { Text } from "../text";
import { Player } from "game/player";
import { rectSprite } from "@core/pixi-utils";
import { gsap } from "gsap";

@responsive
export class LevelUpPopup extends Container implements IResizeObservable {
    private readonly skillPool = inject(SkillPool);
    private readonly player = inject(Player);

    @responsive({ anchor: 0.5 })
    private readonly levelText = new Text("LEVEL UP!", { fontSize: 40 });

    @responsive({ pin: 0.5, y: -250 })
    private readonly levelTextContainer = new Container();

    @responsive({ pin: 0.5, y: 0 })
    private readonly optionsContainer = new Container();
    private readonly background = rectSprite({ alpha: 0.5 });

    constructor() {
        super();

        this.addChild(this.background, this.levelTextContainer, this.optionsContainer);
        this.levelTextContainer.addChild(this.levelText);

        this.visible = false;
    }

    async show() {
        this.visible = true;
        gsap.fromTo(this.background, { alpha: 0 }, { alpha: 1, duration: 0.5 });
        gsap.fromTo(this.levelText, { y: 50, alpha: 0 }, { y: 0, alpha: 1, duration: 0.5, delay: 0.25 });

        const skills = this.skillPool.getOptions(this.player);
        const options = skills.map((skill) => new Option(skill));

        const selected = new EventEmitter<Skill>();
        const subscriptions = options.map((option) => option.selected.subscribe(() => selected.emit(option.skill)));

        this.optionsContainer.removeChildren();
        this.optionsContainer.addChild(...options);

        const padding = 10;
        const w = options.map((option) => option.totalWidth).sum + (options.length - 1) * padding;
        let x = -w / 2;
        for (const option of options) {
            x += option.totalWidth / 2;
            option.x = x;
            x += option.totalWidth / 2 + padding;
        }

        gsap.fromTo(options, { alpha: 0, y: 100 }, { alpha: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.5 });

        const selectedSkill = await selected.nextEvent;
        for (const subscription of subscriptions) subscription.unsubscribe();

        gsap.to(options, { alpha: 0, y: -50, stagger: 0.1, duration: 0.5 });
        void gsap.to(this.levelText, { y: -50, alpha: 0, duration: 0.5 }).then(() => (this.visible = false));

        return selectedSkill;
    }

    resize({ width, height }: IDimensions) {
        this.background.width = width;
        this.background.height = height;
    }
}

export class Option extends Container {
    readonly selected = new EventEmitter();

    readonly totalWidth = 200;
    readonly totalHeight = 300;
    readonly imageHeight = 40;

    constructor(readonly skill: Skill) {
        super();

        const options = {
            wordWrap: true,
            wordWrapWidth: this.totalWidth - 30,
        };

        const bg = rectSprite({ width: this.totalWidth, height: 300, color: 0x000000 });
        const fg = rectSprite({ width: this.totalWidth - 10, height: 290, color: 0x004040 });

        const title = new Text(skill.name, { fontSize: 20, align: "center", ...options });
        const image = Sprite.from(skill.image);
        image.uniformHeight = this.imageHeight;
        const description = new Text(skill.description, { fontSize: 12, align: "center", ...options });

        const skillLevel = skill.learned ? skill.level + 1 : 0;
        const level = new Text(skill.levelDescription(skillLevel), { fontSize: 12, ...options });

        let y = -this.totalHeight / 2 + title.height / 2 + 10;
        title.y = y;
        y += title.height + 20;
        image.y = y;
        y += this.imageHeight + 20;
        description.y = y;
        y += description.height + 10;

        level.x = -this.totalWidth / 2 + 20;
        level.y = y;
        y += level.height + 5;

        this.addChild(bg, fg, image, title, description, level);

        for (const el of [bg, fg, image, title, description]) el.anchor.set(0.5);

        this.interactive = true;
        this.cursor = "pointer";
        this.on("pointerdown", () => this.selected.emit());
    }
}
