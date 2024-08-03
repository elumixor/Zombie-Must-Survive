import { Actor, CircleColliderComponent, PhysicsComponent, TrackerComponent } from "@core";
import { responsive } from "@core/responsive";
import { HealthComponent, HitEffectComponent, MeleeAttackComponent } from "game-zombie/components";
import { Sprite } from "pixi.js";
import { XpCrystal } from "../xp-crystal";

@responsive
export class Enemy extends Actor {
    @responsive({ scale: [-0.3, 0.3], anchor: 0.5 })
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

        this.tracker.forceRequested.subscribe((v) => {
            this.sprite.scale.x = -sign(v.x, 1) * abs(this.sprite.scale.x);
            this.physics.addForce(v);
        });
        this.tracker.lag = 0.5;

        this.collider.selfTags.add("enemy");
        this.collider.targetTags.add("enemy");
        this.collider.targetTags.add("player");

        this.collider.forceRequested.subscribe((v) => this.physics.addForce(v.mul(0.1)));
        this.collider.radius = 20;

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
}
