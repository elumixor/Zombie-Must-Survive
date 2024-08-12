import { Actor, vec2 } from "@core";
import { EventEmitter, type ISubscription } from "@elumixor/frontils";
import { Enemy, MainLevel } from "game-zombie/actors";
import { Sprite } from "pixi.js";

export class Spirit extends Actor {
    readonly died = new EventEmitter();

    speed = 10;
    damage = 5;
    lifetime = 5;
    radius = 50;

    private velocity = vec2.zero;

    private readonly sprite = this.addChild(Sprite.from("spirit"));

    private target?: Enemy;
    private subscription?: ISubscription;

    constructor() {
        super();

        this.layer = "foreground";
        this.sprite.anchor.set(0.5);
    }

    beginPlay() {
        super.beginPlay();

        const { level } = this;
        assert(level instanceof MainLevel, "Spirit can only be added to MainLevel");

        const enemies = level.enemyManager.enemies;

        // Handle the case with no enemies on the screen
        if (enemies.isEmpty) {
            this.velocity.copyFrom(vec2.random);
            return;
        }

        // Get random enemy
        this.target = enemies.pick();
        this.subscription = this.target.health.died.subscribeOnce(async () => {
            this.target = undefined;
            await this.fadeOut();
            this.destroy();
        });
    }

    override update(dt: number) {
        super.update(dt);

        this.position.iadd(this.velocity.withLength(this.speed * dt));
        this.sprite.rotation = this.velocity.angle + Math.PI / 2;

        if (this.target) {
            const direction = this.target.worldPosition.sub(this.worldPosition);
            this.velocity.copyFrom(direction);
            if (direction.length < this.radius) {
                this.subscription?.unsubscribe();
                this.target.health.damage(this.damage);
                this.destroy();
            }
        }
    }

    private async fadeOut() {
        await this.time.to(this.sprite, {
            alpha: 0,
            duration: 0.3,
            ease: "expo.out",
        });
    }
}
