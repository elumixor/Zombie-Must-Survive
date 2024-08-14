import { Actor, CircleColliderComponent, PhysicsComponent, TrackerComponent } from "@core";
import { HealthComponent, HitEffectComponent, MeleeAttackComponent } from "game-zombie/components";
import { Sprite } from "pixi.js";
import { XpCrystal } from "../pick-ups/xp-crystal";

export class Enemy extends Actor {
    readonly sprite = this.addChild(Sprite.from("worker"));

    readonly tracker = this.addComponent(new TrackerComponent(this));
    readonly collider = this.addComponent(new CircleColliderComponent(this));
    readonly physics = this.addComponent(new PhysicsComponent(this));
    readonly health = this.addComponent(new HealthComponent(this));
    readonly hitEffect = this.addComponent(new HitEffectComponent(this));
    readonly weapon = this.addComponent(new MeleeAttackComponent(this));

    constructor() {
        super();

        this.name = "Enemy";
        this.layer = "foreground";

        this.sprite.anchor.set(0.5);

        this.tracker.forceRequested.subscribe((v) => {
            this.sprite.scale.x = sign(v.x, 1) * abs(this.sprite.scale.x);
            this.physics.addForce(v);
        });
        this.tracker.lag = 0.5;

        this.collider.selfTags.add("enemy");
        this.collider.targetTags.add("enemy");
        this.collider.targetTags.add("player");

        this.collider.forceRequested.subscribe((v) => this.physics.addForce(v.mul(0.1)));
        this.collider.radius = 50;

        this.physics.drag = 0.5;

        this.health.health = 5;

        this.health.damaged.subscribe((damage) => {
            this.hitEffect.tintSprite(this.sprite);
            this.hitEffect.showText(damage);
        });

        this.health.died.subscribe(async () => {
            this.collider.destroy();
            this.removeComponent(this.weapon, this.collider, this.tracker);

            const crystal = new XpCrystal();
            crystal.position.copyFrom(this);
            this.level.addChild(crystal);

            await this.time.to(this.sprite, {
                alpha: 0,
                angle: sign(this.sprite.scale.x) * 90,
                duration: 1,
                ease: "expo.out",
            });

            this.destroy();
        });

        this.weapon.tags.add("player");
        this.weapon.delay = 0.1;
    }

    freeze(seconds: number) {
        this.tracker.tickEnabled = false;
        this.weapon.tickEnabled = false;

        void this.time.delay(seconds).then(() => {
            this.tracker.tickEnabled = true;
            this.weapon.tickEnabled = true;
        });
    }
}
