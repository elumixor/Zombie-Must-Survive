import { Actor, Component, Time } from "@core";
import { di } from "@elumixor/di";
import { Enemy } from "game-zombie/actors";
import { HealthComponent } from "game-zombie/components";
import { Sprite } from "pixi.js";

export class FrankenzombieComponent extends Component {
    private readonly time = di.inject(Time);

    damage = 1;
    radius = 1;
    numBounces = 1;
    cooldown = 1;

    private interval?: ReturnType<Time["interval"]>;
    private beginPlayCalled = false;

    beginPlay() {
        super.beginPlay();
        this.beginPlayCalled = true;
        this.updateParams();
    }

    updateParams() {
        if (!this.beginPlayCalled) return;
        this.interval?.clear();
        this.activate();
        this.interval = this.time.interval(() => this.activate(), this.cooldown);
    }

    private activate() {
        const enemies = this.level.getActorsOfType(Enemy);

        let current = this.actor;
        const hit = new Set([current]);

        for (let i = 0; i < this.numBounces; i++) {
            const next = this.getNextTarget(current, enemies, hit);
            if (!next) break;
            hit.add(next);

            // Damage the enemy
            next.getComponent(HealthComponent)?.damage(this.damage);

            // Draw a sprite between the two actors
            this.addLightning(current, next);

            current = next;
        }
    }

    private getNextTarget(current: Actor, enemies: Enemy[], hit: Set<Actor>) {
        const available = enemies.filter((enemy) => !hit.has(enemy) && enemy.distanceTo(current) <= this.radius);
        return available.pick() as Enemy | undefined;
    }

    private addLightning(from: Actor, to: Actor) {
        const ray = Sprite.from("lightning");
        ray.parentLayer = this.level.layers.get("projectiles");

        this.level.addChild(ray);
        ray.position = from.position;

        ray.anchor.set(0, 0.5);
        ray.rotation = this.actor.angleTo(to);
        ray.width = this.actor.distanceTo(to);

        void this.time.to(ray, { alpha: 0, duration: 0.3, delay: 0.1, ease: "expo.out" }).then(() => ray.destroy());
    }
}
