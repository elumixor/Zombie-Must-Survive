import { Actor, CircleColliderComponent, PhysicsComponent, Vec2 } from "@core";
import { di } from "@elumixor/di";
import { HealthComponent } from "game-zombie/components";
import { ResourcesZombie } from "game-zombie/resources-zombie";

export class AuraCloudActor extends Actor {
    override readonly name = "AuraCloud";
    private readonly resources = di.inject(ResourcesZombie);
    private readonly spine = this.addChild(this.resources.fart.copy());
    private readonly collider = this.addComponent(new CircleColliderComponent(this));
    private readonly physics = this.addComponent(new PhysicsComponent(this));

    constructor(radius: number, damage: number, targetGroups: Set<string>, velocity: Vec2) {
        super();

        this.layer = "overlay";

        this.physics.velocity.copyFrom(velocity);
        this.spine.y += 20;

        this.collider.isTrigger = true;
        this.collider.radius = radius;

        for (const group of targetGroups) this.collider.targetTags.add(group);

        this.collider.collisionEntered.subscribe((collisions) => {
            for (const target of collisions) {
                const healthComponent = target.actor.getComponent(HealthComponent);
                if (healthComponent) healthComponent.damage(damage);
            }
        });
    }

    override beginPlay() {
        super.beginPlay();

        this.spine.animate("attack");

        const scale = this.collider.radius / 70;

        // this.time.fromTo(this.spine, { alpha: 0 }, { alpha: 1, duration: 0.1 });
        this.time.fromTo(this.scale, { x: scale, y: scale }, { x: scale * 1.2, y: scale * 1.2, duration: 0.2 });
        void this.time.to(this.spine, { alpha: 0, duration: 0.5, delay: 0.5 }).then(() => this.destroy());
    }
}
