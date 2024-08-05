import { Actor, CircleColliderComponent, inject, PhysicsComponent } from "@core";
import { EventEmitter } from "@elumixor/frontils";
import { HealthComponent, HitEffectComponent } from "game-zombie/components";
import { Controls } from "game-zombie/controls";
import { GameState } from "game-zombie/game-state";
import { PlayerUI } from "game-zombie/ui";
import { Sprite, type IPointData } from "pixi.js";

export class Player extends Actor {
    private readonly playerState = inject(GameState).player;

    readonly died = new EventEmitter();

    private readonly controls = inject(Controls);

    private readonly speed = 5;

    readonly sprite = this.addChild(Sprite.from("zombie"));

    readonly collider = this.addComponent(new CircleColliderComponent(this));
    readonly physics = this.addComponent(new PhysicsComponent(this));
    readonly health = this.addComponent(new HealthComponent(this));
    readonly hitEffect = this.addComponent(new HitEffectComponent(this));

    private readonly ui = this.addChild(new PlayerUI());

    private readonly followScaleMaxDistance = 30;
    private readonly followScaleMaxScale = 1.2;
    private readonly followScaleSpeed = 0.1;
    private readonly followDistanceFactor = 0.1;

    constructor() {
        super();

        this.name = "Player";
        this.layer = "foreground";

        this.sprite.scale.set(0.3);
        this.sprite.anchor.set(0.5);

        this.health.health = this.playerState.hp;
        this.health.maxHealth = this.playerState.maxHp;

        this.ui.y = -55;

        this.collider.selfTags.add("player");
        this.collider.targetTags.add("enemy");
        this.collider.pushStrength = 100;

        this.playerState.skillsChanged.subscribe(() => this.updateSkills());
        this.updateSkills();

        // Animate on hit - tween to red
        this.health.damaged.subscribe((damage) => {
            this.hitEffect.tintSprite(this.sprite);
            this.hitEffect.showText(damage);
        });
        this.health.changed.subscribe((health) => (this.playerState.hp = health));
        this.playerState.hpChanged.subscribe((hp) => {
            this.health.maxHealth = this.playerState.maxHp;
            this.health.health = hp;
        });

        // Animate on death
        this.health.died.subscribe(() => this.die());
    }

    override beginPlay() {
        super.beginPlay();

        // Subscribe to controls
        this.controls.movementChanged.subscribe(this.onMovementChanged);

        // Play appear animation
        this.time.fromTo(this, { alpha: 0 }, { alpha: 1, duration: 0.5 });
        this.time.fromTo(this.scale, { x: 0, y: 0 }, { x: 1, y: 1, ease: "bounce", duration: 0.5 });
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
        // this.spine.animate("run", { loop: true });
    }

    private idle() {
        // this.spine.animate("idle", { loop: true });
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

        const targetScale = lerp(this.followScaleMaxScale, 1, clamp01(difference.length / this.followScaleMaxDistance));
        const diff = targetScale - camera.scale.x;

        camera.scale.iadd(diff * this.followScaleSpeed * dt);
    }

    private updateSkills() {
        for (const skill of this.playerState.skills) skill.applyTo(this);
    }

    private readonly onMovementChanged = ({ x: dx, y: dy }: IPointData) => {
        if (dx === 0) {
            if (dy === 0) this.moving = false;
            else this.moving = true;
            return;
        }

        const { x } = this.sprite.scale;
        this.sprite.scale.x = abs(x) * sign(dx);
        this.moving = true;
    };
}
