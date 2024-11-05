import { Actor, vec2 } from "@core";
import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
import { Enemy } from "game-zombie/actors";
import { HealthComponent } from "game-zombie/components";
import { ResourcesZombie } from "game-zombie/resources-zombie";
import { PeriodicSkillComponent } from "../periodic-skill-component";

export class BiteSpawnerComponent extends PeriodicSkillComponent {
    private readonly resources = di.inject(ResourcesZombie);

    damage = 1;
    radius = 100;

    protected override async activate() {
        const spine = this.resources.bite.copy();
        spine.parentLayer = this.level.layers.get("foreground");
        this.level.addChild(spine);
        spine.scale.set(this.radius / 100);
        // spine.width = spine.height = this.radius * 2;

        let spawnPosition;

        // Get all enemies in the level
        const enemies = this.level.getActorsOfType(Enemy);

        // Set random position if there are no enemies
        if (enemies.isEmpty) {
            const { screenSize } = this.level;
            const randomScreenPoint = screenSize.mul(vec2(random(), random()));
            spawnPosition = this.level.screenToWorld(randomScreenPoint);
        } else {
            // Otherwise, set the position to the enemy with the most enemies around
            const enemiesAround = enemies.map((enemy) => this.enemiesAround(enemy, enemies));
            const enemyIndex = enemiesAround.map((group) => group.length).argmax;
            const enemy = enemies[enemyIndex];
            spawnPosition = enemy.position;

            // Damage all enemies in the radius
            for (const enemy of enemiesAround[enemyIndex]) {
                const health = enemy.getComponent(HealthComponent);
                health?.damage(this.damage);
            }
        }

        this.level.setWorldPosition(spine, spawnPosition);
        spine.y += this.radius;

        // Animate the bite
        const { x, y } = spine.scale;
        await all(
            spine.animate("attack", { promise: true }),
            this.time.fromTo(spine, { y: spine.y + this.radius }, { y: spine.y, duration: 0.5 }),
            this.time.fromTo(
                spine.scale,
                { x: x * 0.8, y: 0 },
                { y: y * 1.5, x: x * 1.5, duration: 0.5, ease: "expo.out" },
            ),
        );

        await this.time.to(spine.scale, { x: 0, y: 0, duration: 0.2 });
        spine.destroy();
    }

    private enemiesAround(enemy: Actor, enemies: Actor[]) {
        return enemies.filter((other) => other.distanceTo(enemy) <= this.radius);
    }
}
