import { Actor, CircleColliderComponent, vec2 } from "@core";
import { di } from "@elumixor/di";
import { HealthComponent } from "game-zombie/components";
import { ResourcesZombie } from "game-zombie/resources-zombie";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Sprite } from "pixi.js";

gsap.registerPlugin(MotionPathPlugin);

export class AcidPoolActor extends Actor {
    private readonly resources = di.inject(ResourcesZombie);

    lifetime = 1;
    damageRate = 1;
    damage = 1;
    radius = 50;
    targetPoint = vec2.zero;
    override tickEnabled = false;
    travelDuration = 0.5;

    private elapsed = 0;
    private readonly collider = this.addComponent(new CircleColliderComponent(this));
    private readonly sprite = this.addChild(Sprite.from("acid-pool-projectile"));
    private readonly spine = this.addChild(this.resources.pool.copy());

    private readonly damagingActors = new Set<Actor>();

    constructor() {
        super();

        this.spine.visible = false;

        this.layer = "background";
        this.collider.isTrigger = true;

        this.collider.targetTags.add("enemy");
        this.collider.collisionEntered.subscribe((other) => {
            for (const collider of other) this.damagingActors.add(collider.actor);
        });
        this.collider.collisionExited.subscribe((other) => {
            for (const collider of other) this.damagingActors.delete(collider.actor);
        });
    }

    async startAnimation() {
        this.collider.radius = this.radius;
        this.spine.scale.set(this.radius / 100);
        this.elapsed = this.damageRate; // to start damaging immediately
        this.spine.animate("attack", { loop: true });

        const duration = this.travelDuration;

        const scale = this.spine.scale.x;
        void this.time.fromTo(this.scale, { x: 0, y: 0 }, { x: scale, y: scale, duration });

        const p = { x: 0, y: 0 };
        const { x, y } = this.targetPoint.sub(this.worldPosition);
        const basePosition = this.worldPosition;
        const topY = min(0, y) - 100;

        await this.time.to(p, {
            motionPath: {
                path: [
                    { x: x * 0.5, y: topY },
                    { x, y },
                ],
            },
            onUpdate: () => void (this.worldPosition = basePosition.add(p)),
            onComplete: () => void (this.tickEnabled = true),
            ease: "power2.in",
            duration,
        });

        this.sprite.visible = false;
        this.spine.visible = true;
    }

    override update(dt: number) {
        super.update(dt);

        const ds = this.time.dMs / 1000;

        this.lifetime -= ds;
        if (this.lifetime <= 0) {
            this.tickEnabled = false;
            void this.time.to(this.spine.scale, { x: 0, y: 0, duration: 0.2 }).then(() => {
                this.destroy();
            });
        }

        this.elapsed += ds;
        if (this.elapsed <= this.damageRate) return;
        this.elapsed -= this.damageRate;

        for (const actor of this.damagingActors) actor.getComponent(HealthComponent)?.damage(this.damage);
    }
}
