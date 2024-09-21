import { EventEmitter } from "@elumixor/frontils";
import { c } from "game-zombie/config";
import { Skill } from "game-zombie/skills";

@c
export class PlayerState {
    readonly levelChanged = new EventEmitter<number>();
    readonly levelUp = new EventEmitter<number>();
    readonly xpChanged = new EventEmitter<number>();
    readonly hpChanged = new EventEmitter<number>();
    readonly died = new EventEmitter();
    readonly skillsChanged = new EventEmitter();

    readonly skills = new Set<Skill>();

    @c(c.num(), { tabGroup: "Player" })
    private readonly levelXpFactor = 10;

    @c(c.num(), { tabGroup: "Player" })
    private readonly constitution = 5;

    @c(c.num(), {
        tabGroup: "Player",
        onUpdate: (instances) => {
            for (const instance of instances) {
                const i = instance as { _hp: number; maxHp: number; hpChanged: EventEmitter<number> };
                i._hp = i.maxHp;
                i.hpChanged.emit(i._hp);
            }
        },
    })
    private readonly baseHp = 100;

    @c(c.bool(), { tabGroup: "Player" })
    private restoreHpOnLevelUp = false;

    private _xp = 0;
    private _bonusHealth = 0;
    private _hp = this.maxHp;

    constructor() {
        this.levelChanged.subscribe(() => {
            if (this.restoreHpOnLevelUp) this.hp = this.maxHp;
            else {
                this.hpChanged.emit(this.hp);
            }
        });
    }

    get isDead() {
        return this.hp <= 0;
    }

    get hp() {
        return this._hp;
    }
    set hp(value) {
        value = max(0, value);

        if (this._hp === value) return;

        const dead = this.isDead;
        this._hp = value;

        this.hpChanged.emit(value);

        if (this.hp <= 0 && !dead) this.died.emit();
    }

    get maxHp() {
        return this.baseHp + this.level * this.constitution + this._bonusHealth;
    }

    set bonusHealth(value: number) {
        const diff = value - this._bonusHealth;
        this._bonusHealth = value;
        this.hp += diff;
    }

    get level() {
        const b = this.levelXpFactor / 2;
        const a = b;
        const c = -this._xp;

        const D = b * b - 4 * b * c;
        if (D < 0) throw new Error(`Invalid negative xp ${this._xp}`);

        // Only the positive root is valid
        return floor((-b + sqrt(D)) / (2 * a)) + 1;
    }

    get xp() {
        return this._xp;
    }
    set xp(value) {
        if (this._xp === value) return;

        const previousLevel = this.level;
        this._xp = value;

        const level = this.level;
        if (previousLevel !== level) this.levelChanged.emit(level);
        if (level > previousLevel) this.levelUp.emit(level);

        this.xpChanged.emit(value);
    }

    get nextLevelXp() {
        const n = this.level;
        return (n * (n + 1) * this.levelXpFactor) / 2;
    }

    get previousLevelXp() {
        const n = this.level - 1;
        return (n * (n + 1) * this.levelXpFactor) / 2;
    }

    get remainingXp() {
        return this.nextLevelXp - this.xp;
    }

    @c(c.button(), { tabGroup: "Player" })
    forceLevelUp() {
        this.xp = this.nextLevelXp;
    }

    @c(c.button(), { tabGroup: "Player" })
    forceDeath() {
        this.hp = 0;
    }
}
