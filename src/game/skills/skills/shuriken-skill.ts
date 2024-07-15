import type { ICircleContainer } from "game/circle-container";
import { RangedAttack, Weapon } from "game/weapons";
import { Skill, type ISkilled, type SkillRarity } from "../skill";

export class ShurikenSkill extends Skill {
    readonly name = "Shuriken";
    readonly description = "A deadly weapon of the ninja";
    readonly image = "shuriken";

    override readonly maxLevel = 4;
    private readonly numProjectiles = [1, 1, 1, 3, 5];
    private readonly spread = [0, 0, 0, 30, 45];
    private readonly damage = [1, 2, 2, 2, 2];
    private readonly damageInterval = [0.2, 0.2, 0.2, 0.25, 0.25];
    private readonly pierce = [1, 1, 3, 4, 4];

    protected readonly rarities = ["common", "common", "common", "rare", "rare"] as SkillRarity[];

    private weapon?: Weapon;

    override applyTo(character: ISkilled & ICircleContainer) {
        super.applyTo(character);
        this.carrier = character;
        this.weapon = this.getWeapon(character);
    }

    update() {
        if (!this.weapon) throw new Error("Weapon not set");
        this.weapon.tryUse();
    }

    levelDescription(level: number) {
        if (level === 0) return "Throw a single shuriken";
        if (level === 1) return "Damage +100%";
        if (level === 2) return "Pass through +2 enemies";
        if (level === 3) return "+2 shurikens, +1 pass through";
        if (level === 4) return "+2 shurikens";

        throw new Error("Max level reached");
    }

    reset() {
        this.level = 0;
        this.weapon = undefined;
        this.carrier = undefined;
    }

    protected changeLevel() {
        if (!this.carrier) throw new Error("Carrier not set");
        this.weapon = this.getWeapon(this.carrier);
    }

    private getWeapon(carrier: ICircleContainer) {
        const level = this.level;

        return new RangedAttack({
            projectile: {
                texture: "shuriken",
                radius: 5,
                movement: {
                    speed: 10,
                    acceleration: -0.3,
                    max: 10,
                    min: 0,
                },
                rotation: {
                    speed: 0,
                    acceleration: 2,
                    max: 5,
                },
                distance: 100,
                lifetime: 1,
                fadeDuration: 0.3,
                pierce: this.pierce[level],
                damageInterval: this.damageInterval[level],
            },
            triggerRange: 300,
            carrier,
            targetType: "enemy",
            damage: this.damage[level],
            numProjectiles: this.numProjectiles[level],
            rate: 0.3,
            spread: this.spread[level],
        });
    }
}
