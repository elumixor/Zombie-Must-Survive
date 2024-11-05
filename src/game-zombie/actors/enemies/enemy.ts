import { Actor, CircleColliderComponent, PhysicsComponent, Time, TrackerComponent, Vec2 } from "@core";
import { di } from "@elumixor/di";
import { HealthComponent, HitEffectComponent, MeleeAttackComponent } from "game-zombie/components";
import { ResourcesZombie, type EnemySpine, type EnemySpineKey } from "game-zombie/resources-zombie";
import { XpCrystal } from "../pick-ups/xp-crystal";
import { SoundsZombie } from "game-zombie/sounds-zombie";

export class Enemy extends Actor {
    private readonly resources = di.inject(ResourcesZombie);
    private readonly sounds = di.inject(SoundsZombie);

    readonly tracker = this.addComponent(new TrackerComponent(this));
    readonly health = this.addComponent(new HealthComponent(this));
    readonly weapon = this.addComponent(new MeleeAttackComponent(this));

    private readonly spine;
    private readonly deathSpine = this.resources.enemyDeath.copy();

    private readonly collider = this.addComponent(new CircleColliderComponent(this));
    private readonly physics = this.addComponent(new PhysicsComponent(this));
    private readonly hitEffect = this.addComponent(new HitEffectComponent(this));
    private freezeTimeout?: ReturnType<Time["timeout"]>;

    xpFactor = 1;

    constructor(enemySpine: EnemySpineKey) {
        super();

        this.spine = this.addChild(this.resources[enemySpine].copy()) as EnemySpine;

        this.name = "Enemy";
        this.layer = "foreground";

        this.tracker.forceRequested.subscribe((v) => {
            this.spine.scale.x = sign(v.x, 1) * abs(this.spine.scale.x);
            this.physics.addForce(v);
        });

        this.collider.selfTags.add("enemy");
        this.collider.targetTags.add("enemy");
        this.collider.targetTags.add("player");
        this.collider.targetTags.add("environment");

        this.collider.forceRequested.subscribe((v) => this.physics.addForce(v.mul(0.1)));
        this.collider.radius = 50;

        this.physics.drag = 0.5;

        this.health.health = 5;

        this.health.damaged.subscribe((damage) => {
            const hits = this.sounds.enemyHit;
            const sound = random() < 0.8 ? hits[0] : hits[1];
            void sound.playOnce();
            this.hitEffect.tintSprite(this.spine);
            this.hitEffect.showText(damage);
        });

        this.health.died.subscribe(async () => {
            for (const component of [this.health, this.weapon, this.tracker, this.physics, this.collider])
                component.destroy();

            const count = max(1, round(this.xpFactor));
            const value = this.xpFactor / count;
            const scale = lerp(0.5, 1.5, value / 2);

            for (const _ of range(count)) {
                const crystal = new XpCrystal(value);
                crystal.scale.set(random(scale * 0.9, scale * 1.1));
                crystal.position.copyFrom(this);
                crystal.position.iadd(Vec2.random().withLength(random(50, 100)));
                this.level.addChild(crystal);
            }

            this.removeChild(this.spine);
            this.addChild(this.deathSpine);

            await this.deathSpine.animate("death", { promise: true });

            this.destroy();
        });

        this.weapon.tags.add("player");
        this.weapon.requiredAnimation = {
            trigger: () => void this.attack(),
            event: this.spine.events.attack,
        };
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
        if (!this.destroyed) this.spine.animate("run", { loop: true });
    }
}
