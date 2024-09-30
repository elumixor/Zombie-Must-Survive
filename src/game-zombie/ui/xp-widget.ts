import { rectSprite } from "@core";
import { di } from "@elumixor/di";
import { GameState } from "game-zombie/game-state";
import { gsap } from "gsap";
import { Container, type ColorSource } from "pixi.js";
import { TextWidget } from "./text-widget";

export class XpWidget extends Container {
    private readonly gameState = di.inject(GameState);

    private readonly border;
    private readonly background;
    private readonly foreground;
    private readonly levelText;

    private readonly levelMask;
    private readonly size;

    constructor({
        size = 26,
        borderSize = 2,
        fontSize = 30,
        color: {
            border = "black" as ColorSource,
            background = "rgb(53, 41, 63)" as ColorSource,
            foreground = "rgb(171, 97, 231)" as ColorSource,
        } = {},
    } = {}) {
        super();

        this.border = this.addChild(
            rectSprite({ width: size + borderSize * 2, height: size + borderSize * 2, color: border }),
        );
        this.background = this.addChild(rectSprite({ width: size, height: size, color: background }));
        this.foreground = this.addChild(rectSprite({ width: size, height: size, color: foreground }));
        this.levelText = this.addChild(new TextWidget("1", { fontSize, fill: "white" }));
        this.size = this.foreground.height * sqrt(2);

        this.border.anchor.set(0.5);
        this.background.anchor.set(0.5);
        this.foreground.anchor.set(0.5);
        this.levelText.anchor.set(0.5);
        this.levelText.x = 1;

        this.border.angle = 45;
        this.background.angle = 45;
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
        this.levelText.fitTo(30, 30);
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
