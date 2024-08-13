import { Actor, CircleColliderComponent, vec2 } from "@core";
import { Sprite } from "pixi.js";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { gsap } from "gsap";
import { HealthComponent } from "game-zombie/components";

gsap.registerPlugin(MotionPathPlugin);

export class PoolActor extends Actor {
    lifetime = 1;
    damageRate = 1;
    damage = 1;
    radius = 50;
    targetPoint = vec2.zero;
    tickEnabled = false;

    private elapsed = 0;
    private readonly collider = this.addComponent(new CircleColliderComponent(this));
    private readonly sprite = this.addChild(Sprite.from("pool"));

    private readonly damagingActors = new Set<Actor>();

    constructor() {
        super();

        this.layer = "foreground";
        this.sprite.anchor.set(0.5);
        this.collider.isTrigger = true;

        this.collider.targetTags.add("enemy");
        this.collider.collisionEntered.subscribe((other) => {
            for (const collider of other) this.damagingActors.add(collider.actor);
        });
        this.collider.collisionExited.subscribe((other) => {
            for (const collider of other) this.damagingActors.delete(collider.actor);
        });
    }

    startAnimation() {
        this.collider.radius = this.radius;
        this.sprite.uniformHeight = this.radius * 3;
        this.elapsed = this.damageRate; // to start damaging immediately

        const duration = 0.5;

        const scale = this.sprite.scale.x;
        void this.time.fromTo(this.scale, { x: 0, y: 0 }, { x: scale, y: scale, duration });

        const p = { x: 0, y: 0 };
        const { x, y } = this.targetPoint.sub(this.worldPosition);
        const basePosition = this.worldPosition;
        const topY = min(0, y) - 100;
        void this.time.to(p, {
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
    }

    update(dt: number) {
        super.update(dt);

        const ds = this.time.dMs / 1000;

        this.lifetime -= ds;
        if (this.lifetime <= 0) {
            this.tickEnabled = false;
            void this.time.to(this.sprite.scale, { x: 0, y: 0, duration: 0.2 }).then(() => {
                this.destroy();
            });
        }

        this.elapsed += ds;
        if (this.elapsed <= this.damageRate) return;
        this.elapsed -= ds;

        for (const actor of this.damagingActors) actor.getComponent(HealthComponent)?.damage(this.damage);
    }
}
