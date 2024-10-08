import { Actor, CircleColliderComponent, PhysicsComponent, Time, TrackerComponent } from "@core";
import { di } from "@elumixor/di";
import { HealthComponent, HitEffectComponent, MeleeAttackComponent } from "game-zombie/components";
import { ResourcesZombie } from "game-zombie/resources-zombie";
import { XpCrystal } from "../pick-ups/xp-crystal";
import type { EnemyType } from "./enemy-type";

export class Enemy extends Actor {
    private readonly resources = di.inject(ResourcesZombie);

    readonly spine;

    readonly tracker = this.addComponent(new TrackerComponent(this));
    readonly collider = this.addComponent(new CircleColliderComponent(this));
    readonly physics = this.addComponent(new PhysicsComponent(this));
    readonly health = this.addComponent(new HealthComponent(this));
    readonly hitEffect = this.addComponent(new HitEffectComponent(this));
    readonly weapon = this.addComponent(new MeleeAttackComponent(this));

    private freezeTimeout?: ReturnType<Time["timeout"]>;

    constructor(enemyType: EnemyType) {
        super();

        this.spine = this.addChild(this.resources[enemyType].copy());
        this.spine.y = 50;

        this.name = "Enemy";
        this.layer = "foreground";

        this.tracker.forceRequested.subscribe((v) => {
            this.spine.scale.x = sign(v.x, 1) * abs(this.spine.scale.x);
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
            this.hitEffect.tintSprite(this.spine);
            this.hitEffect.showText(damage);
        });

        this.health.died.subscribe(async () => {
            this.collider.destroy();
            this.removeComponent(this.weapon, this.collider, this.tracker);

            const crystal = new XpCrystal();
            crystal.position.copyFrom(this);
            this.level.addChild(crystal);

            await this.spine.animate("die", { promise: true });

            this.destroy();
        });

        this.weapon.tags.add("player");
        this.weapon.delay = 0.1;
        this.weapon.onUse.subscribe(() => this.attack());
    }

    override beginPlay() {
        super.beginPlay();

        this.spine.animate("run", { loop: true });
    }

    freeze(seconds: number) {
        this.tracker.tickEnabled = false;
        this.weapon.tickEnabled = false;

        this.spine.speed = 0;

        if (this.freezeTimeout) this.freezeTimeout.clear();

        this.freezeTimeout = this.time.timeout(() => {
            this.tracker.tickEnabled = true;
            this.weapon.tickEnabled = true;
            this.spine.speed = 1;
        }, seconds);
    }

    override destroy() {
        super.destroy();
        this.freezeTimeout?.clear();
    }

    private async attack() {
        await this.spine.animate("attack", { promise: true });
        this.spine.animate("run", { loop: true });
    }
}
