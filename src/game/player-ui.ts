import { responsive } from "@core/responsive";
import { Container } from "pixi.js";
import { Bar } from "./bar";
import { rectSprite } from "@core/pixi-utils";
import gsap from "gsap";
import { EventEmitter } from "@elumixor/frontils";
import { Text } from "./text";

@responsive
export class PlayerUI extends Container {
    readonly levelChanged = new EventEmitter<number>();
    readonly healthChanged = new EventEmitter<number>();

    private _level = 1;
    private readonly constitution = 2;

    @responsive({ x: 50, y: 20 })
    private readonly healthBar = new Bar({
        max: this.maxHealth,
        value: this.maxHealth,
        color: 0xff0000,
        width: 200,
        height: 20,
    });

    @responsive({ x: 50, y: 42 })
    private readonly experienceBar = new Bar({
        max: this.nextLevelExperience,
        value: 0,
        color: 0x0000ff,
        width: 150,
        height: 10,
    });

    @responsive({ anchor: 0.5, angle: 45, x: 45, y: 39 })
    private readonly levelBackground = rectSprite({ width: 40, height: 40 });

    @responsive({ anchor: 0.5, angle: 45, x: 45, y: 39 })
    private readonly levelForeground = rectSprite({ width: 35, height: 35, color: 0x335699 });

    @responsive({ anchor: 0.5, x: 45, y: 37 })
    private readonly levelText = new Text("1", {
        fontSize: 20,
    });

    constructor() {
        super();

        this.levelText.resolution = 2;

        this.addChild(this.healthBar, this.experienceBar, this.levelBackground, this.levelForeground, this.levelText);
        this.alpha = 0;
    }

    get level() {
        return this._level;
    }
    set level(value) {
        if (this._level === value) return;

        const previousExperience = this.experience;
        const remaining = Math.max(previousExperience - this.nextLevelExperience, 0);

        this._level = value;
        this.levelText.text = value.toString();
        gsap.to(this.levelText.scale, { x: 1.5, y: 1.5, duration: 0.1, yoyo: true, repeat: 1 });

        this.healthBar.max = this.maxHealth;
        this.healthBar.value = this.maxHealth;
        this.experienceBar.max = this.nextLevelExperience;
        this.experienceBar.value = remaining;

        this.levelChanged.emit(value);
    }

    get maxHealth() {
        return 10 + this.level * this.constitution;
    }
    get nextLevelExperience() {
        return this.level * 10;
    }

    get experience() {
        return this.experienceBar.value;
    }
    set experience(value) {
        if (value >= this.nextLevelExperience) this.level++;
        else this.experienceBar.value = value;
    }

    get health() {
        return this.healthBar.value;
    }
    set health(value) {
        if (value === this.health) return;
        this.healthBar.value = value;
        this.healthChanged.emit(value);
    }

    reset() {
        gsap.to(this, { alpha: 1, duration: 0.5 });

        this.experience = 0;
        this.level = 1;
        this.health = this.maxHealth;
    }
}
