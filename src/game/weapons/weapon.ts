import { inject } from "@core/di";
import type { ICircleContainer } from "game/circle-container";
import type { ICharacter } from "../systems/character";
import { World } from "../world";

export abstract class Weapon {
    protected readonly world = inject(World);
    protected lastUsed = -Infinity;
    protected readonly targets;

    constructor(
        protected readonly carrier: ICircleContainer,
        protected readonly targetTag: string,
        protected readonly damage: number,
        protected readonly triggerRange: number,
        protected readonly fireInterval: number,
    ) {
        this.targets = this.world.getTargets(targetTag) as Set<ICharacter>;
    }

    protected get targetsInRange() {
        return [...this.targets].filter((target) => this.distanceTo(target) < this.triggerRange);
    }

    protected get closestTarget() {
        let closest: ICharacter | undefined;
        let minDistance = Infinity;

        for (const target of this.targets) {
            const distance = this.distanceTo(target);
            if (distance < this.triggerRange && distance < minDistance) {
                closest = target;
                minDistance = distance;
            }
        }

        return closest;
    }

    tryUse() {
        if (this.canUse) {
            this.use();
            this.lastUsed = Date.now();
        }
    }

    protected distanceTo(target: ICharacter) {
        return this.carrier.distanceTo(target) - target.radius - this.carrier.radius;
    }

    protected get canUse() {
        return Date.now() - this.lastUsed > this.fireInterval * 1000;
    }

    protected abstract use(): void;
}
