import { Component, Time, Vec2 } from "@core";
import { di } from "@elumixor/di";
import { BeholderTurret } from "./beholder-turret";

/** Spawns {@link BeholderTurret} */

export class BeholderSpawnerComponent extends Component {
    private readonly time = di.inject(Time);
    tickEnabled = false;

    damage = 1;
    fireCooldown = 1;
    spawnCooldown = 1;
    maxInstances = 3;
    lifetime = 2;
    fireDistance = 1000;

    spawnRadius = 200;

    private interval?: ReturnType<Time["interval"]>;
    private readonly instances = new Array<BeholderTurret>();

    beginPlay() {
        super.beginPlay();

        assert(!this.interval);
        this.spawn();
        this.interval = this.time.interval(() => this.spawn(), this.spawnCooldown);
    }

    updateParams() {
        if (this.interval) {
            this.interval.clear();
            this.interval = this.time.interval(() => this.spawn(), this.spawnCooldown);
        }
    }

    private spawn() {
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
