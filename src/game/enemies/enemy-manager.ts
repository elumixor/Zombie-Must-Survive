import { inject, injectable } from "@core/di";
import { Resizer } from "@core/responsive";
import { GameTime } from "game/game-time";
import { World } from "game/world";
import { Container } from "pixi.js";
import { Interval } from "../interval";
import { Player } from "../player/player";
import { Enemy } from "./enemy";
import { clamp } from "@core/utils";

@injectable
export class EnemyManager extends Container {
    private readonly resizer = inject(Resizer);
    private readonly player = inject(Player);
    private readonly world = inject(World);
    private readonly gameTime = inject(GameTime);

    spawnInterval;
    maxZombies;
    minZombies;
    zombieMass;

    private readonly spawner;

    readonly enemies = [] as Enemy[];

    attraction = 1;
    repulsion = 0.5;
    friction = 0.5;

    constructor({ spawnInterval = 0.3, maxZombies = 100, minZombies = 3, zombieMass = 10 } = {}) {
        super();

        this.spawnInterval = spawnInterval;
        this.maxZombies = maxZombies;
        this.minZombies = minZombies;
        this.zombieMass = zombieMass;

        this.spawner = new Interval(() => this.spawn(), this.spawnInterval);
    }

    restart() {
        for (const zombie of this.enemies) zombie.destroy();
        this.enemies.clear();
        this.spawner.start();
        this.gameTime.remove(this.move);
        this.gameTime.add(this.move);
    }

    stop() {
        this.spawner.pause();
        this.gameTime.remove(this.move);
    }

    pause() {
        this.spawner.pause();
        this.gameTime.remove(this.move);
    }

    private spawn() {
        if (this.enemies.length >= this.maxZombies) return;

        // Spawn a zombie
        const zombie = new Enemy(this.zombieMass);

        // Position it outside the screen
        const r = Math.random();
        const vertical = r > 0.5;
        let { width, height } = this.resizer.dimensions;

        // Increase a bit so that they are really off-screen
        width *= 1.2;
        height *= 1.2;

        if (vertical) {
            zombie.y = (Math.sign(r - 0.75) * height) / 2;
            zombie.x = (Math.random() - 0.5) * width;
        } else {
            zombie.x = (Math.sign(r - 0.25) * width) / 2;
            zombie.y = (Math.random() - 0.5) * height;
        }

        this.enemies.push(zombie);
        this.world.spawn(zombie, { tag: "enemy", relative: true });

        zombie.died.subscribe(() => {
            this.enemies.remove(zombie);
            if (this.enemies.length < this.minZombies) this.spawn();
        });
    }

    // Boids-like movement
    private readonly move = (dt: number) => {
        for (const enemy of this.enemies) {
            const force = { x: 0, y: 0 };

            // Attraction to the player
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;

            const angle = Math.atan2(dy, dx);

            force.x += Math.cos(angle) * this.attraction;
            force.y += Math.sin(angle) * this.attraction;

            // Repulsion from other zombies
            for (const other of this.enemies) {
                if (other === enemy) continue;

                const dx = other.x - enemy.x;
                const dy = other.y - enemy.y;

                const distance = Math.hypot(dx, dy);

                if (distance > 100) continue;

                const angle = Math.atan2(dy, dx);

                let repulsion = -this.repulsion * Math.log(distance / 100);
                repulsion = clamp(repulsion, 0, 10);

                force.x -= Math.cos(angle) * repulsion;
                force.y -= Math.sin(angle) * repulsion;
            }

            // Friction
            force.x -= enemy.speed.x * this.friction;
            force.y -= enemy.speed.y * this.friction;

            // Update
            enemy.update(force, dt);

            // Check distance from the player
            const minDistance = enemy.radius + this.player.radius;
            const distance = enemy.distanceTo(this.player);

            if (distance < minDistance) {
                const angle = enemy.angleTo(this.player);
                enemy.x = this.player.x - Math.cos(angle) * minDistance;
                enemy.y = this.player.y - Math.sin(angle) * minDistance;
            }

            // Check Z index
            enemy.zIndex = enemy.y > this.player.y ? 1 : -1;
        }
    };
}
