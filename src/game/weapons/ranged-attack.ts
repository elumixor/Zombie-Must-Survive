import type { ICharacter } from "../systems";
import { Weapon } from "./weapon";
import { Projectile, type IProjectileConfig } from "./projectile";

export class RangedAttack extends Weapon {
    protected readonly numProjectiles;
    protected readonly projectile;
    protected readonly spread;

    constructor({
        carrier,
        targetType,
        damage,
        numProjectiles = 1,
        spread = 0,
        projectile,
        range = projectile.distance * 2,
        rate,
    }: {
        carrier: ICharacter;
        targetType: "enemy" | "player";
        damage: number;
        range?: number;
        rate: number;
        projectile: IProjectileConfig;
        numProjectiles?: number;
        spread?: number;
    }) {
        super(carrier, targetType, damage, range, rate);

        if ((spread === 0) !== (numProjectiles === 1))
            throw new Error("spread and numProjectiles must be either both 0 or both > 1");

        this.numProjectiles = numProjectiles;
        this.projectile = projectile;
        this.spread = (Math.PI / 180) * spread;
    }

    protected use() {
        const { closestTarget } = this;
        if (!closestTarget) return;

        // Find the closest enemy
        const { x, y, radius } = this.carrier;

        // Determine direction and distance
        const baseAngle = this.carrier.angleTo(closestTarget);

        for (let i = 0; i < this.numProjectiles; i++) {
            const angle = baseAngle + (i - (this.numProjectiles - 1) / 2) * this.spread;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);

            // Spawn particles (this can be refactored into a separate class)
            const projectile = new Projectile({
                ...this.projectile,
                damage: this.damage,
                position: { x: x + dx * radius, y: y + dy * radius },
                direction: { x: dx, y: dy },
                affects: this.targets, // this is not dynamic...
            });

            this.world.spawn(projectile);
        }
    }
}
