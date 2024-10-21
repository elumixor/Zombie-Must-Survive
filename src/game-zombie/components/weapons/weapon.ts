import { Component, PhysicsComponent, Sound, Time, Vec2, type Actor } from "@core";
import { di } from "@elumixor/di";
import { EventEmitter } from "@elumixor/frontils";

export class WeaponComponent extends Component {
    protected readonly time = di.inject(Time);

    readonly onUse = new EventEmitter();

    /** Actor tags that this weapon affects/targets  */
    readonly tags = new Set<string>();

    sounds?: Sound | Sound[];

    /** Amount of HP that this weapon removes */
    damage = 1;

    /** How close should be the target actor in order to trigger this attack? */
    triggerRange = 100;

    /** How many seconds should pass before this weapon can be used again */
    cooldown = 1;

    /** Whether this weapon can attack the target if it's in range */
    attackWithTargetInRange = true;

    protected cooldownFinished = true;

    delay = 0;

    protected get carrierVelocity() {
        const physics = this.actor.getComponent(PhysicsComponent);
        return physics ? physics.velocity : Vec2.zero;
    }

    override update() {
        if (!this.cooldownFinished) return;

        // Get trigger targets
        const targetsInRange = [...this.level.collisionManager.getCollisions(this.actor, this.tags, this.triggerRange)];

        // If enemy in range not required, then use weapon
        // Otherwise, check if there are any enemies in range
        if (!this.attackWithTargetInRange || targetsInRange.nonEmpty) {
            this.cooldownFinished = false;
            this.onUse.emit();
            this.use(targetsInRange);
            void this.time.delay(this.cooldown).then(() => (this.cooldownFinished = true));
        }
    }

    protected use(_targetsInRange?: Actor[]) {
        if (Array.isArray(this.sounds)) void this.sounds.pick().play();
        else void this.sounds?.play();
    }

    protected closest(targets: Actor[]) {
        return targets.sort((a, b) => a.distanceTo(this.actor) - b.distanceTo(this.actor)).first as Actor | undefined;
    }
}
