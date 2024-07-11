import { inject } from "@core/di";
import { World } from "../world";
import type { ICharacter } from "../systems/character";

export abstract class Weapon {
    protected readonly world = inject(World);
    protected lastUsed = -Infinity;
    protected readonly targets;

    constructor(
        protected readonly carrier: ICharacter,
        protected readonly targetTag: string,
        protected readonly damage: number,
        protected readonly range: number,
        protected readonly fireInterval: number,
    ) {
        this.targets = this.world.getTargets(targetTag) as Set<ICharacter>;
    }

    protected get closestTarget() {
        let closest: ICharacter | undefined;
        let minDistance = Infinity;

        for (const target of this.targets) {
            const distance = this.carrier.distanceTo(target) - target.radius - this.carrier.radius;
            if (distance < this.range && distance < minDistance) {
                closest = target;
                minDistance = distance;
            }
        }

        return closest;
    }

    tryUse() {
        if (this.canUse()) {
            this.use();
            this.lastUsed = Date.now();
        }
    }

    protected canUse() {
        return Date.now() - this.lastUsed > this.fireInterval * 1000;
    }

    protected abstract use(): void;
}
