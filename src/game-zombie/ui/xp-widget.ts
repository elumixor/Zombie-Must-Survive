import { inject, rectSprite } from "@core";
import { GameState } from "game-zombie/game-state";
import { gsap } from "gsap";
import { Container } from "pixi.js";
import { TextWidget } from "./text-widget";

export class XpWidget extends Container {
    private readonly gameState = inject(GameState);

    private readonly background = this.addChild(rectSprite({ width: 23, height: 23 }));
    private readonly foregroundDark = this.addChild(rectSprite({ width: 20, height: 20, color: "rgb(53, 41, 63)" }));
    private readonly foreground = this.addChild(rectSprite({ width: 20, height: 20, color: "rgb(171, 97, 231)" }));
    private readonly levelText = this.addChild(new TextWidget("1", { fontSize: 18 }));

    private readonly levelMask;
    private readonly size = this.foreground.height * sqrt(2);

    constructor() {
        super();

        this.background.anchor.set(0.5);
        this.foregroundDark.anchor.set(0.5);
        this.foreground.anchor.set(0.5);
        this.levelText.anchor.set(0.5);
        this.levelText.x = 1;

        this.background.angle = 45;
        this.foregroundDark.angle = 45;
        this.foreground.angle = 45;

        this.levelMask = this.addChild(rectSprite({ width: this.size, height: this.size, color: "white" }));
        this.levelMask.anchor.set(0.5, 1);
        this.foreground.mask = this.levelMask;

        this.levelMask.y = this.levelMask.height / 2;

        this.gameState.player.xpChanged.subscribe(() => this.update());
        this.gameState.player.levelChanged.subscribe((level) => (this.level = level));
        this.update();
        this.level = 1;
    }

    private set level(value: number) {
        this.levelText.text = value.toString();
        this.levelText.fitTo(15, 15);
        const { x, y } = this.levelText.scale;
        gsap.to(this.levelText.scale, {
            x: x * 1.5,
            y: y * 1.5,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            overwrite: true,
        });
    }

    private update() {
        const { xp, nextLevelXp, previousLevelXp } = this.gameState.player;
        const progress = (xp - previousLevelXp) / (nextLevelXp - previousLevelXp);
        gsap.to(this.levelMask, { height: progress * this.size, duration: 0.2, ease: "expo.out", overwrite: true });
    }
}
