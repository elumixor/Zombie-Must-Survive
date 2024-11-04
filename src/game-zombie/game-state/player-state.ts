import { EventEmitter } from "@elumixor/frontils";
import { c, numberEditor } from "game-zombie/config";
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

    @c(c.arr(numberEditor), { tabGroup: "Player" })
    private readonly levelXPThresholds = [10, 20, 30, 40, 50];

    @c(c.arr(numberEditor), { tabGroup: "Player" })
    private readonly levelMaxHealth = [10, 20, 30, 40, 50];

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
    @c(c.bool(), { tabGroup: "Player" })
    private restoreHpOnLevelUp = false;

    private _xp = 0;
    private _bonusHealth = 0;
    private _hp = this.maxHp;

    constructor() {
        this.levelChanged.subscribe(() => {
            if (this.restoreHpOnLevelUp) this.hp = this.maxHp;
            else {
                const currentMaxHp = this.levelMaxHealth[max(this.level - 1, 0)];
                const previousMaxHp = this.levelMaxHealth[max(this.level - 2, 0)];
                const diff = currentMaxHp - previousMaxHp;
                this.hp += diff;
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

        logs(`HP: ${value}`);

        this.hpChanged.emit(value);

        if (this.hp <= 0 && !dead) this.died.emit();
    }

    get maxHp() {
        const level = clamp(this.level, 1, this.levelMaxHealth.length) - 1;
        return this.levelMaxHealth[level] + this.bonusHealth;
    }

    get bonusHealth() {
        return this._bonusHealth;
    }
    set bonusHealth(value: number) {
        const diff = value - this._bonusHealth;
        this._bonusHealth = value;
        this.hp += diff;
    }

    get level() {
        return this.levelXPThresholds.filter((xp) => xp <= this.xp).length + 1;
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

        logs(`XP: ${value}`, { color: "rgb(170, 235, 255)" });

        this.xpChanged.emit(value);
    }

    get nextLevelXp() {
        const level = min(this.level, this.levelXPThresholds.length) - 1;
        return this.levelXPThresholds[level];
    }

    get previousLevelXp() {
        return this.level <= 1 ? 0 : this.levelXPThresholds[this.level - 2];
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
