import type { Actor } from "@core";
import { WeaponComponent } from "./weapon";
import { HealthComponent } from "../health";

export class MeleeAttackComponent extends WeaponComponent {
    override triggerRange = 100;

    protected override use(targetInRange?: Actor[]) {
        const closest = targetInRange?.sort(
            (a, b) =>
                a.worldPosition.distanceTo(this.actor.worldPosition) -
                b.worldPosition.distanceTo(this.actor.worldPosition),
        ).first;
        assert(closest, "Cannot use melee weapon without a target in range");

        const health = closest.getComponent(HealthComponent);
        assert(health, "Melee attack target must have health component");

        health.damage(this.damage);
    }
}
