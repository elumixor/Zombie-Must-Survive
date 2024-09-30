import { Vec2, type Actor } from "@core";
import { WeaponComponent } from "../weapon";
import { Projectile } from "./projectile";
import { ProjectileConfig } from "./projectile-config";

export class ProjectileWeaponComponent extends WeaponComponent {
    numProjectiles = 1;
    spread = 0;
    projectileConfig = new ProjectileConfig();
    override triggerRange = 500;
    override attackWithTargetInRange = true;

    protected override use(targetsInRange: Actor[]) {
        // const { carrierVelocity } = this;

        const closestTarget = this.closest(targetsInRange);
        assert(closestTarget);

        const baseAngle = this.actor.worldPosition.angleTo(closestTarget.worldPosition);

        // Spawn projectiles
        for (let i = 0; i < this.numProjectiles; i++) {
            const projectile = new Projectile(this.projectileConfig, this.tags);

            // Each traveling with a different angle
            const angle = baseAngle + (i - (this.numProjectiles - 1) / 2) * deg2rad(this.spread);
            const dx = cos(angle);
            const dy = sin(angle);
            projectile.direction = new Vec2(dx, dy);

            // Add to the level
            this.level.addChild(projectile);
            projectile.worldPosition = this.actor.worldPosition;

            // Add carrier velocity
            // projectile.physics.addVelocity(carrierVelocity);
        }
    }
}
