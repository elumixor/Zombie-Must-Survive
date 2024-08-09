import { Time, Actor, rectSprite } from "@core";
import { di } from "@elumixor/di";
import { WeaponComponent } from "./weapon";
import { HealthComponent } from "../health";

export class RayWeapon extends WeaponComponent {
    protected readonly time = di.inject(Time);

    protected use(targetsInRange: Actor[]) {
        const target = this.closest(targetsInRange);
        assert(target);

        const ray = rectSprite({ width: 100, height: 10, color: "rgb(214, 0, 0)" });
        ray.parentLayer = this.level.layers.get("projectiles");

        this.level.addChild(ray);
        ray.position = this.actor.position;

        ray.anchor.set(0, 0.5);
        ray.rotation = this.actor.angleTo(target);
        ray.width = this.actor.distanceTo(target);

        const healthComponent = target.getComponent(HealthComponent);
        if (healthComponent) healthComponent.damage(this.damage);

        void this.time.to(ray, { alpha: 0, duration: 0.3, delay: 0.1, ease: "expo.out" }).then(() => ray.destroy());
    }
}
