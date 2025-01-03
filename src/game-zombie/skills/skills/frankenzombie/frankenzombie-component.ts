import { Actor } from "@core";
import { Enemy } from "game-zombie/actors";
import { HealthComponent } from "game-zombie/components";
import { Sprite } from "pixi.js";
import { PeriodicSkillComponent } from "../periodic-skill-component";

export class FrankenzombieComponent extends PeriodicSkillComponent {
    damage = 1;
    distance = 1;
    numBounces = 1;

    protected override activate() {
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
        const available = enemies.filter((enemy) => {
            const distance = enemy.distanceTo(current);
            return !hit.has(enemy) && distance <= this.distance;
        });
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
