import { Actor, CircleColliderComponent, PhysicsComponent, Vec2 } from "@core";
import { di } from "@elumixor/di";
import { EventEmitter } from "@elumixor/frontils";
import { HealthComponent, HitEffectComponent } from "game-zombie/components";
import { c } from "game-zombie/config";
import { Controls } from "game-zombie/controls";
import { GameState } from "game-zombie/game-state";
import { ResourcesZombie } from "game-zombie/resources-zombie";
import { PlayerUI } from "game-zombie/ui";

@c
export class Player extends Actor {
    readonly died = new EventEmitter();

    private readonly playerState = di.inject(GameState).player;
    private readonly resources = di.inject(ResourcesZombie);
    private readonly controls = di.inject(Controls);

    private _gold = 0;

    @c(c.num())
    speed = 10;

    @c(c.bool(), {
        tabGroup: "Player",
        onUpdate: (instances, value) => {
            for (const instance of instances) {
                const i = instance as Player;
                i.health.invulnerable = value as boolean;
            }
        },
    })
    private invulnerable = false;
    readonly spine = this.addChild(this.resources.zombie.copy());
    readonly collider = this.addComponent(new CircleColliderComponent(this));
    readonly pickupCollider = this.addComponent(new CircleColliderComponent(this));
    readonly physics = this.addComponent(new PhysicsComponent(this));
    readonly health = this.addComponent(new HealthComponent(this));
    readonly hitEffect = this.addComponent(new HitEffectComponent(this));

    private readonly ui = this.addChild(new PlayerUI());

    private readonly followScaleMaxDistance = 30;
    private readonly followScaleMinScale = 0.8;

    private readonly followScaleSpeed = 0.1;
    private readonly followDistanceFactor = 0.1;

    constructor() {
        super();

        this.name = "Player";
        this.layer = "foreground";

        this.health.maxHealth = this.playerState.maxHp;
        this.health.health = this.playerState.hp;

        this.ui.y = -85;

        this.collider.selfTags.add("player");
        this.collider.targetTags.add("enemy");
        this.collider.pushStrength = 100;

        this.pickupCollider.selfTags.add("pickUp");
        this.pickupCollider.radius = 100;

        // Animate on hit - tween to red
        this.health.damaged.subscribe((damage) => {
            if (this.invulnerable) return;

            this.hitEffect.tintSprite(this.spine);
            this.hitEffect.showText(damage);
        });
        this.health.changed.subscribe((health) => (this.playerState.hp = health));
        this.playerState.hpChanged.subscribe((hp) => {
            this.health.maxHealth = this.playerState.maxHp;
            this.health.health = hp;
        });

        // Animate on death
        this.health.died.subscribe(() => this.die());

        // Otherwise, the animation spawns as a detached rotated head. Hard to tell why, but spine is strange...
        this.spine.animate("idle");
        this.spine.update(0);
    }

    set bonusHealth(value: number) {
        this.playerState.bonusHealth = value;
    }

    get gold() {
        return this._gold;
    }
    set gold(value) {
        this._gold = value;
        logs(`Player now has ${value} gold`, { color: "#FFD700", key: "gold" });
    }

    override beginPlay() {
        super.beginPlay();

        // Subscribe to controls
        this.controls.movementChanged.subscribe(this.onMovementChanged);

        // Play appear animation
        this.time.fromTo(this, { alpha: 0 }, { alpha: 1, duration: 0.5 });
        this.time.fromTo(this.scale, { x: 0, y: 0 }, { x: 1, y: 1, ease: "bounce", duration: 0.5 });

        // Apply skills
        for (const skill of this.playerState.skills) skill.applyTo(this);

        this.idle();
    }

    override destroy() {
        this.controls.movementChanged.unsubscribe(this.onMovementChanged);
        super.destroy();
    }

    private set moving(value: boolean) {
        if (value) this.run();
        else this.idle();
    }

    private run() {
        if (this.spine.currentAnimation?.name === "run") return;
        this.spine.animate("run-normal", { loop: true });
    }

    private idle() {
        this.spine.animate("idle", { loop: true });
    }

    private die() {
        this.died.emit();
        // this.spine.animate("death");
    }

    override update(dt: number) {
        super.update(dt);

        // Pass the current velocity to the physics component
        this.physics.velocity.copyFrom(this.controls.currentSpeed.normalized.mul(this.speed));

        // Make the camera follow the player slowly
        const { camera } = this.level;
        const difference = this.position.sub(camera);

        camera.position.iadd(difference.mul(this.followDistanceFactor * dt));

        const targetScale = lerp(1, this.followScaleMinScale, clamp01(difference.length / this.followScaleMaxDistance));
        const diff = targetScale - camera.scale.x;

        camera.scale.iadd(diff * this.followScaleSpeed * dt);
    }

    private readonly onMovementChanged = ({ x: dx, y: dy }: Vec2) => {
        if (dx === 0) {
            if (dy === 0) this.moving = false;
            else this.moving = true;
            return;
        }

        const { x } = this.spine.scale;
        this.spine.scale.x = abs(x) * sign(dx);
        this.moving = true;
    };
}
