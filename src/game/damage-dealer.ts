import type { Constructor } from "@elumixor/frontils";
import type { WithHealth } from "./health";

export function damageDealer<T extends Constructor>(Base: T) {
    return class extends Base {
        damage = 1;
        hitFrequency = 0.5;

        private canDamage = true;

        tryDamage(target: WithHealth) {
            if (!this.canDamage) return;
            this.canDamage = false;
            window.setTimeout(() => (this.canDamage = true), this.hitFrequency * 1000);
            target.takeDamage(this.damage);
        }
    };
}
