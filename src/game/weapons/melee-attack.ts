import { Weapon } from "./weapon";

export class MeleeAttack extends Weapon {
    protected use() {
        const { closestTarget } = this;
        if (!closestTarget) return;
        closestTarget.hp -= this.damage;
    }
}
