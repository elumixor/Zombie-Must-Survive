import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Container } from "pixi.js";
import { Bar } from "./bar";
import { rectSprite } from "@core/pixi-utils";
import { gsap } from "gsap";
import { Text } from "../text";
import { inject } from "@core/di";
import { Player } from "../player/player";
import { Controls } from "./controls";
import { LevelUpPopup } from "./level-up-popup";
import { Clock } from "./clock";

@responsive
export class PlayerUI extends Container implements IResizeObservable {
    private readonly player = inject(Player);

    @responsive({ x: 50, y: 20 })
    private readonly hpBar = new Bar({
        max: this.player.maxHp,
        value: this.player.maxHp,
        color: 0xff0000,
        width: 200,
        height: 20,
    });

    @responsive({ x: 50, y: 42 })
    private readonly xpBar = new Bar({
        max: this.player.nextLevelXp - this.player.previousLevelXp,
        value: this.player.xp - this.player.previousLevelXp,
        color: 0x0000ff,
        width: 150,
        height: 10,
    });

    @responsive({ anchor: 0.5, angle: 45 })
    private readonly levelBackground = rectSprite({ width: 40, height: 40 });

    @responsive({ anchor: 0.5, angle: 45 })
    private readonly levelForeground = rectSprite({ width: 35, height: 35, color: 0x335699 });

    @responsive({ anchor: 0.5, x: 45, y: 37 })
    private readonly levelText = new Text("1", { fontSize: 20 });

    @responsive({ x: 45, y: 39 })
    private readonly levelBackgroundContainer = new Container();
    @responsive({ x: 45, y: 39 })
    private readonly levelForegroundContainer = new Container();

    @responsive({ pin: [0, 1] })
    private readonly controls = new Controls(30);
    private readonly levelUpPopup = new LevelUpPopup();

    @responsive({ pin: [0.5, 0], y: 30 })
    private readonly clock = new Clock();

    constructor() {
        super();

        this.addChild(
            this.hpBar,
            this.xpBar,
            this.levelBackgroundContainer,
            this.levelForegroundContainer,
            this.levelText,
            this.clock,
            this.controls,
        );
        this.levelBackgroundContainer.addChild(this.levelBackground);
        this.levelForegroundContainer.addChild(this.levelForeground);

        // Hide by-default
        this.levelBackgroundContainer.scale.set(0);
        this.levelForegroundContainer.scale.set(0);
        this.levelText.alpha = 0;
        this.xpBar.alpha = 0;
        this.hpBar.alpha = 0;
        this.controls.alpha = 0;

        this.player.hpChanged.subscribe((hp) => (this.hpBar.value = hp));
        this.player.xpChanged.subscribe((xp) => (this.xpBar.value = xp - this.player.previousLevelXp));
        this.player.levelChanged.subscribe((level) => {
            // Update hp
            this.hpBar.max = this.player.maxHp;
            this.hpBar.value = this.player.hp;
            // Update xp
            this.xpBar.max = this.player.nextLevelXp - this.player.previousLevelXp;
            this.xpBar.value = this.player.xp - this.player.previousLevelXp;
            // Update text label
            this.levelText.text = level;
        });
    }

    set hidden(value: boolean) {
        if (!value) {
            // Show
            gsap.to(this.levelBackgroundContainer.scale, { x: 1, y: 1, duration: 0.5 });
            gsap.to(this.levelForegroundContainer.scale, { x: 1, y: 1, duration: 0.5, delay: 0.2 });
            gsap.to(this.levelText, { alpha: 1, duration: 0.5, delay: 0.3 });
            gsap.to(this.hpBar, { alpha: 1, duration: 1, delay: 0.4 });
            gsap.to(this.xpBar, { alpha: 1, duration: 1, delay: 0.6 });
            gsap.to(this.controls, { alpha: 1, duration: 0.5 });
            gsap.to(this.controls.scale, { x: 1, y: 1, duration: 0.5 });
        } else {
            gsap.to(this.levelBackgroundContainer.scale, { x: 0, y: 0, duration: 0.5 });
            gsap.to(this.levelForegroundContainer.scale, { x: 0, y: 0, duration: 0.5, delay: 0.2 });
            gsap.to(this.levelText, { alpha: 0, duration: 0.5, delay: 0.3 });
            gsap.to(this.hpBar, { alpha: 0, duration: 1, delay: 0.4 });
            gsap.to(this.xpBar, { alpha: 0, duration: 1, delay: 0.6 });
            gsap.to(this.controls, { alpha: 0, duration: 0.5 });
            gsap.to(this.controls.scale, { x: 0, y: 0, duration: 0.5 });
        }
    }

    set gameTime(value: number) {
        this.clock.time = value;
    }

    resize({ scale }: IDimensions) {
        this.controls.scale.set(1 / scale); // Controls should have the same size (?)
    }

    showLevelUp() {
        this.addChild(this.levelUpPopup);
        return this.levelUpPopup.show();
    }
}
