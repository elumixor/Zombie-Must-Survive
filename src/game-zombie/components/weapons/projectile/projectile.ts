import { Actor, CircleColliderComponent, PhysicsComponent, Vec2 } from "@core";
import { Sprite } from "pixi.js";
import type { ProjectileConfig } from "./projectile-config";
import { HealthComponent } from "game-zombie/components/health";

export class Projectile extends Actor {
    direction = Vec2.one;

    readonly sprite;
    readonly physics = this.addComponent(new PhysicsComponent(this));
    readonly collider = this.addComponent(new CircleColliderComponent(this));

    private distanceTraveled = 0;
    private rotationSpeed = 0;
    private isDying = false;

    private collisionsLeft;

    constructor(
        private readonly config: ProjectileConfig,
        targetGroups: Set<string>,
    ) {
        super();

        this.layer = "overlay";
        this.sprite = this.addChild(Sprite.from(this.config.texture));
        this.sprite.anchor.set(0.5);

        this.collider.isTrigger = true;
        this.collider.radius = config.radius;

        this.collisionsLeft = config.pierce + 1;

        for (const group of targetGroups) this.collider.targetTags.add(group);

        this.collider.collisionEntered.subscribe((collisions) => {
            for (const target of collisions) {
                const healthComponent = target.actor.getComponent(HealthComponent);
                if (healthComponent) healthComponent.damage(this.config.damage);

                this.collisionsLeft--;
                if (this.collisionsLeft <= 0) {
                    this.collider.destroy();
                    this.removeComponent(this.collider, this.physics);
                    this.die();
                    break;
                }
            }
        });
    }

    override beginPlay() {
        super.beginPlay();

        const { movement, scale } = this.config;

        {
            const { drag, startSpeed, minSpeed, maxSpeed } = movement;
            this.physics.drag = drag;
            this.physics.maxSpeed = maxSpeed;
            this.physics.minSpeed = minSpeed;
            this.physics.addVelocity(this.direction.mul(startSpeed));
        }

        this.scale.copyFrom(scale);

        this.rotationSpeed = this.config.rotation?.startSpeed ?? 0;
    }

    override update(dt: number) {
        super.update(dt);

        this.physics.addForce(this.direction.mul(this.config.movement.startSpeed));
        this.distanceTraveled += this.physics.velocity.length * dt;

        if (this.config.rotation) {
            const { acceleration, minSpeed, maxSpeed } = this.config.rotation;
            this.rotationSpeed += acceleration * dt;
            this.rotationSpeed = clamp(this.rotationSpeed, minSpeed, maxSpeed);
            this.angle += this.rotationSpeed * dt;
        }

        if (this.config.alignToDirection) this.rotation = this.direction.angle;

        if (this.distanceTraveled >= this.config.distance) this.die();
    }

    private die() {
        if (this.isDying) return;
        this.isDying = true;
        void this.time.to(this.sprite, { alpha: 0, duration: 0.5, ease: "expo.out" }).then(() => this.destroy());
    }

    // private readonly update = (dt: number) => {
    //     const {
    //         movement,
    //         direction,
    //         rotation,
    //         lifetime,
    //         distance,
    //         fadeDuration,
    //         radius,
    //         damage,
    //         pierce = 0,
    //         affects,
    //         damageInterval = 0,
    //     } = this.config;

    //     const deltaMS = this.time.ticker.deltaMS / 1000;

    //     {
    //         const { acceleration, max, min } = rotation;

    //         if (acceleration) this.angularSpeed += acceleration * dt;
    //         if (max !== undefined) this.angularSpeed = min(this.angularSpeed, max);
    //         if (min !== undefined) this.angularSpeed = max(this.angularSpeed, min);

    //         this.rotation += this.angularSpeed * dt;
    //     }

    //     {
    //         const { acceleration, max, min } = movement;
    //         const { x: dx, y: dy } = direction;

    //         if (acceleration) this.speed += acceleration * dt;
    //         if (max !== undefined) this.speed = min(this.speed, max);
    //         if (min !== undefined) this.speed = max(this.speed, min);

    //         const s = this.speed * dt;

    //         this.x += dx * s;
    //         this.y += dy * s;

    //         this.distanceTraveled += s;
    //         this.elapsed += deltaMS;
    //     }

    //     if (this.distanceTraveled >= distance || this.elapsed >= lifetime) {
    //         this.elapsedFadeOut += deltaMS;
    //         this.alpha = clamp01((fadeDuration - this.elapsedFadeOut) / fadeDuration);

    //         if (this.alpha <= 0) {
    //             this.time.remove(this.update);
    //             this.destroy();
    //             return;
    //         }
    //     }

    //     // Check collisions
    //     if (this.collisions < pierce) {
    //         let collided = false;
    //         const now = Date.now();
    //         for (const affected of affects) {
    //             const distance = this.distanceTo(affected);

    //             if (distance < affected.radius + radius) {
    //                 const lastDamaged = this.lastDamaged.get(affected) ?? 0;
    //                 const elapsed = now - lastDamaged;
    //                 if (elapsed >= damageInterval * 1000) {
    //                     affected.hp -= damage;
    //                     this.lastDamaged.set(affected, now);
    //                 }

    //                 this.collisions++;

    //                 if (!collided) this.elapsed = max(lifetime, this.elapsed);
    //                 collided = true;
    //             }
    //         }
    //     }

    //     if (this.elapsedFadeOut >= fadeDuration || this.collisions >= pierce) {
    //         this.time.remove(this.update);
    //         this.destroy();
    //     }
    // };
}
