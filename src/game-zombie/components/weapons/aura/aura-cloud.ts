import { Actor, CircleColliderComponent, PhysicsComponent, Vec2, circleSprite } from "@core";
import { HealthComponent } from "game-zombie/components";
import type { ColorSource } from "pixi.js";

export class AuraCloudActor extends Actor {
    private readonly sprite;
    private readonly collider = this.addComponent(new CircleColliderComponent(this));
    private readonly physics = this.addComponent(new PhysicsComponent(this));

    constructor(radius: number, color: ColorSource, damage: number, targetGroups: Set<string>, velocity: Vec2) {
        super();

        this.name = "AuraCloud";

        this.layer = "overlay";
        this.sprite = this.addChild(circleSprite({ radius, color, alpha: 0.5 }));

        this.physics.velocity.copyFrom(velocity);

        const acceleration = velocity.mul(-0.1);
        this.physics.acceleration.copyFrom(acceleration);

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

        this.time.fromTo(this.sprite, { alpha: 0 }, { alpha: 1, duration: 0.1 });
        this.time.fromTo(this.scale, { x: 1, y: 1 }, { x: 1.05, y: 1.05, duration: 0.2 });
        void this.time.to(this.sprite, { alpha: 0, duration: 0.2, delay: 0.2 }).then(() => this.destroy());
    }
}
