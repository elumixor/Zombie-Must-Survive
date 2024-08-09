import { Actor, Component, Time, vec2 } from "@core";
import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
import { Enemy } from "game-zombie/actors";
import { HealthComponent } from "game-zombie/components";
import { Sprite } from "pixi.js";

export class BiteSpawnerComponent extends Component {
    private readonly time = di.inject(Time);
    tickEnabled = false;

    damage = 1;
    radius = 100;
    spawnCooldown = 1;

    private interval?: ReturnType<Time["interval"]>;

    beginPlay() {
        super.beginPlay();

        assert(!this.interval);
        void this.spawn();
        this.interval = this.time.interval(() => void this.spawn(), this.spawnCooldown);
    }

    updateParams() {
        if (this.interval) {
            this.interval.clear();
            this.interval = this.time.interval(() => void this.spawn(), this.spawnCooldown);
        }
    }

    private async spawn() {
        const sprite = Sprite.from("bite");
        sprite.anchor.set(0.5, 1);
        sprite.parentLayer = this.level.layers.get("foreground");
        this.level.addChild(sprite);
        sprite.width = sprite.height = this.radius * 2;

        let spawnPosition;

        // Get all enemies in the level
        const enemies = this.level.getActorsOfType(Enemy);

        // Set random position if there are no enemies
        if (enemies.isEmpty) {
            const { screenSize } = this.level;
            const randomScreenPoint = screenSize.mul(vec2(random(), random()));
            spawnPosition = this.level.screenToWorld(randomScreenPoint);
        } else {
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

        this.level.setWorldPosition(sprite, spawnPosition);
        sprite.y += this.radius;

        // Animate the bite
        const { x, y } = sprite.scale;
        await all(
            this.time.fromTo(sprite, { y: sprite.y + this.radius }, { y: sprite.y, duration: 0.5 }),
            this.time.fromTo(
                sprite.scale,
                { x: x * 0.8, y: 0 },
                { y: y * 1.5, x: x * 1.5, duration: 0.5, ease: "expo.out" },
            ),
        );

        await this.time.to(sprite.scale, { x: 0, y: 0, duration: 0.2 });
        sprite.destroy();
    }

    private enemiesAround(enemy: Actor, enemies: Actor[]) {
        return enemies.filter((other) => other.distanceTo(enemy) <= this.radius);
    }
}
