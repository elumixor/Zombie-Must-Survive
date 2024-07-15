import { circleTexture } from "@core/pixi-utils";
import type { ICircleContainer } from "game/circle-container";
import type { Weapon } from "game/weapons";
import { AuraAttack } from "game/weapons/aura-attack";
import { Texture } from "pixi.js";
import { Skill, type ISkilled, type SkillRarity } from "../skill";

export class AuraSkill extends Skill {
    readonly name = "Stinky Aura";
    readonly description = "A deadly cloud of stench";
    readonly image = "aura";
    protected readonly rarities = ["common", "common", "common", "rare", "rare"] as SkillRarity[];
    protected readonly damage = [4, 4, 4, 8, 16];
    protected readonly radius = [100, 200, 200, 200, 200];
    protected readonly rate = [0.5, 0.5, 0.3, 0.3, 0.3];
    override readonly maxLevel = 4;

    constructor() {
        super();

        // Generate a dummy texture for now
        const image = circleTexture({ radius: 10, color: 0x00aa20 });
        Texture.addToCache(image, "aura");
    }

    private weapon?: Weapon;

    override applyTo(character: ISkilled & ICircleContainer) {
        super.applyTo(character);
        this.weapon = this.getWeapon(character);
    }

    update() {
        if (!this.weapon) throw new Error("Weapon not set");
        this.weapon.tryUse();
    }

    reset() {
        this.level = 0;
        this.weapon = undefined;
        this.carrier = undefined;
    }

    levelDescription(level: number) {
        if (level === 0) return "Noxious fumes that deals damage to all nearby enemies";
        if (level === 1) return "Range x2";
        if (level === 2) return "Increased fire rate";
        if (level === 3) return "Damage +100%";
        if (level === 4) return "Damage +100%";

        throw new Error("Max level exceeded");
    }

    protected changeLevel() {
        if (!this.carrier) throw new Error("Carrier not set");
        this.weapon = this.getWeapon(this.carrier);
    }

    private getWeapon(carrier: ICircleContainer) {
        const level = this.level;

        return new AuraAttack({
            color: 0x00aa20,
            carrier,
            targetType: "enemy",
            damage: this.damage[level],
            radius: this.radius[level],
            rate: this.rate[level],
        });
    }
}
