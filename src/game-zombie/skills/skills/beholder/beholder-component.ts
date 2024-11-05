import { Vec2 } from "@core";
import { PeriodicSkillComponent } from "../periodic-skill-component";
import { BeholderTurret } from "./beholder-turret";

/** Spawns {@link BeholderTurret} */

export class BeholderComponent extends PeriodicSkillComponent {
    damage = 1;
    fireCooldown = 1;
    maxInstances = 3;
    lifetime = 2;
    fireDistance = 1000;
    spawnRadius = 200;

    private readonly instances = new Array<BeholderTurret>();

    protected override activate() {
        if (this.instances.length >= this.maxInstances) {
            const first = this.instances.shift();
            assert(first);
            void first.disappear();
        }

        const turret = new BeholderTurret();

        turret.weapon.damage = this.damage;
        turret.weapon.cooldown = this.fireCooldown;
        turret.weapon.triggerRange = this.fireDistance;

        this.level.addChild(turret);
        turret.worldPosition = this.actor.worldPosition.add(Vec2.random().withLength(this.spawnRadius));

        this.time.timeout(() => {
            if (this.instances.includes(turret)) {
                this.instances.remove(turret);
                void turret.disappear();
            }
        }, this.lifetime);

        this.instances.push(turret);
    }
}
