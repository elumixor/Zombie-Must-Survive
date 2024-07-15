import type { ICircleContainer } from "game/circle-container";
import { Projectile, type IProjectileConfig } from "./projectile";
import { Weapon } from "./weapon";

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
        triggerRange = projectile.distance * 2,
        rate,
    }: {
        carrier: ICircleContainer;
        targetType: "enemy" | "player";
        damage: number;
        triggerRange?: number;
        rate: number;
        projectile: IProjectileConfig;
        numProjectiles?: number;
        spread?: number;
    }) {
        super(carrier, targetType, damage, triggerRange, rate);

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

            const projectile = new Projectile({
                ...this.projectile,
                damage: this.damage,
                position: { x: x + dx * radius, y: y + dy * radius },
                direction: { x: dx, y: dy },
                affects: this.targets,
            });

            this.world.spawn(projectile);
        }
    }
}
