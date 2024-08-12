import { Actor, CircleColliderComponent, PhysicsComponent, TrackerComponent, vec2 } from "@core";
import { all, EventEmitter, type ISubscription } from "@elumixor/frontils";
import { MainLevel } from "game-zombie/actors";
import { MeleeAttackComponent } from "game-zombie/components";
import { Sprite } from "pixi.js";

export class Zombie extends Actor {
    readonly died = new EventEmitter();

    speed = 10;
    lifetime = 5;

    private readonly sprite = this.addChild(Sprite.from("zombiecide"));

    private readonly tracker = this.addComponent(new TrackerComponent(this));
    private readonly physics = this.addComponent(new PhysicsComponent(this));
    private readonly collider = this.addComponent(new CircleColliderComponent(this));
    readonly weapon = this.addComponent(new MeleeAttackComponent(this));

    private currentSubscription?: ISubscription;

    constructor() {
        super();

        this.layer = "foreground";
        this.sprite.anchor.set(0.5);

        this.tracker.forceRequested.subscribe((v) => {
            this.sprite.scale.x = sign(v.x, 1) * abs(this.sprite.scale.x);
            this.physics.addForce(v);
        });
        this.physics.drag = 0.7;

        this.collider.selfTags.add("zombiecide");
        this.collider.targetTags.add("zombiecide");
        this.collider.forceRequested.subscribe((v) => this.physics.addForce(v.mul(0.1)));
        this.collider.radius = 50;

        this.weapon.tags.add("enemy");
        this.weapon.delay = 0.05;
    }

    beginPlay() {
        super.beginPlay();

        void this.spawn().then(async () => {
            this.trackNextEnemy();
            const interval = this.time.interval(() => this.trackNextEnemy(), 0.5);
            await this.time.delay(this.lifetime);
            interval.clear();
            await this.die();
        });
    }

    private trackNextEnemy() {
        const { level } = this;

        assert(level instanceof MainLevel, "Zombie can only be added to MainLevel");

        const enemies = level.enemyManager.enemies;
        this.currentSubscription?.unsubscribe();

        // Handle the case with no enemies on the screen
        if (enemies.isEmpty) {
            if (this.physics.velocity.lengthSquared === 0)
                this.physics.velocity.copyFrom(vec2.random.withLength(this.speed * 0.2));

            return;
        }

        // Find the closest enemy
        const closestIndex = enemies.map((enemy) => enemy.distanceTo(this)).argmin;
        const closestEnemy = enemies[closestIndex];

        this.tracker.target = closestEnemy;

        this.currentSubscription = closestEnemy.health.died.subscribeOnce(() => {
            this.tracker.target = undefined;
            this.trackNextEnemy();
        });
    }

    private async die() {
        this.died.emit();

        this.currentSubscription?.unsubscribe();

        await this.time.to(this.sprite, {
            alpha: 0,
            angle: sign(this.sprite.scale.x) * 90,
            duration: 1,
            ease: "expo.out",
        });

        this.destroy();
    }

    private async spawn() {
        await all(
            this.time.fromTo(this, { alpha: 0 }, { alpha: 1, duration: 0.5 }),
            this.time.fromTo(this.scale, { x: 0, y: 0 }, { x: 1, y: 1, ease: "bounce", duration: 0.5 }),
        );
    }
}
