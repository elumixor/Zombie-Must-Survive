import { Actor, CircleColliderComponent } from "@core";
import { HealthComponent } from "game-zombie/components";
import { Sprite } from "pixi.js";

export class BoomerangActor extends Actor {
    flyAngle = 0;
    flyRadius = 0;
    flyRadiusIncrease = 0;
    speed = 0;
    damage = 1;
    rotationSpeed = 0.3;

    private elapsed = 0;
    private increaseVelocity = 0;

    private readonly sprite = this.addChild(Sprite.from("boomerang"));
    private readonly collider = this.addComponent(new CircleColliderComponent(this));

    constructor() {
        super();

        this.layer = "projectiles";
        this.sprite.anchor.set(0.5);

        this.collider.isTrigger = true;
        this.collider.targetTags.add("enemy");
        this.collider.collisionEntered.subscribe((other) => {
            for (const collider of other) collider.actor.getComponent(HealthComponent)?.damage(this.damage);
        });
    }

    beginPlay() {
        super.beginPlay();

        void this.time.fromTo(this.sprite.scale, { x: 0, y: 0 }, { x: 2, y: 2, duration: 0.2 });
    }

    update(dt: number) {
        super.update(dt);

        this.sprite.rotation += dt * this.rotationSpeed;

        this.elapsed += dt;

        const angle = this.flyAngle + this.elapsed * this.speed;

        this.x = this.flyRadius * Math.cos(angle);
        this.y = this.flyRadius * Math.sin(angle);

        this.increaseVelocity += dt * this.flyRadiusIncrease;
        this.flyRadius += dt * this.increaseVelocity;

        if (this.flyRadius > 1000) this.destroy();
    }
}
