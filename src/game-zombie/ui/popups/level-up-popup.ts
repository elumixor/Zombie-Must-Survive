import { responsive } from "@core/responsive";
import { di } from "@elumixor/di";
import { all, EventEmitter } from "@elumixor/frontils";
import { GameState } from "game-zombie/game-state";
import { Skill } from "game-zombie/skills";
import { gsap } from "gsap";
import { Container, Sprite } from "pixi.js";
import { TextWidget } from "../text-widget";
import { Popup } from "./popup";
import { SkillCard } from "./skill-card";

@responsive
export class LevelUpPopup extends Popup {
    private readonly gameState = di.inject(GameState);

    @responsive({ anchor: 0.5, y: -200 })
    private readonly levelUpBackground = this.container.addChild(Sprite.from("ui-level-up-background"));

    private readonly levelUpText = this.levelUpBackground.addChild(
        new TextWidget("LEVEL UP!", {
            fontSize: 20,
            fill: "white",
            fontWeight: "900",
            dropShadow: undefined,
            strokeThickness: 3,
        }),
    );

    @responsive({ y: 50 })
    private readonly optionsContainer = this.container.addChild(new Container());

    constructor() {
        super();

        this.levelUpText.anchor.set(0.5);
        this.levelUpText.fitTo(120, 40);
        this.levelUpText.y = 7;
    }

    override async show() {
        // Pick several random skills from the pool
        const skills = this.gameState.skillPool.getSkills(this.gameState.player.level);

        // Create visual cards/options for each skill
        const skillCards = skills.map((skill) => new SkillCard(skill, skill === skills.last));

        // Add options to the container and position them correctly
        this.optionsContainer.addChild(...skillCards);
        const padding = 20;
        const w = skillCards.map((option) => option.totalWidth).sum + (skillCards.length - 1) * padding;
        let x = -w / 2;
        for (const option of skillCards) {
            x += option.totalWidth / 2;
            option.x = x;
            x += option.totalWidth / 2 + padding;
        }

        const specialCardContainer = this.optionsContainer.addChild(new Container());
        specialCardContainer.y = 300;

        // Subscribe to selection events. Store subscriptions for cleanup
        const selected = new EventEmitter<Skill>();
        const subscriptions = skillCards.map((option) => option.selected.subscribe(() => selected.emit(option.skill)));

        // Animate show
        await all(
            super.show(),
            gsap.fromTo(skillCards, { alpha: 0, y: 100 }, { alpha: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.5 }),
            gsap.fromTo(this.levelUpBackground, { y: -150, alpha: 0 }, { y: -200, alpha: 1, duration: 1 }),
        );

        // Await selection
        const skill = await selected.nextEvent;

        // Fade out
        await all(
            this.hide(),
            gsap.to(skillCards, { alpha: 0, y: -50, stagger: 0.1, duration: 0.5 }),
            gsap.to(this.levelUpBackground, { y: -50, alpha: 0, duration: 0.5 }),
        );

        // Clean up
        this.optionsContainer.removeChildren();
        for (const subscription of subscriptions) subscription.unsubscribe();

        // Return selected skill
        return skill;
    }
}
