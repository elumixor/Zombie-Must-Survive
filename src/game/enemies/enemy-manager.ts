import { inject, injectable } from "@core/di";
import { Resizer } from "@core/responsive";
import { EventEmitter } from "@elumixor/frontils";
import { GameTime } from "game/game-time";
import { MeleeAttack } from "game/weapons";
import { World } from "game/world";
import { Container } from "pixi.js";
import { Player } from "../player/player";
import { Enemy } from "./enemy";

export type EnemyType = "worker" | "soldier";

interface ISpawnLevel {
    duration: number;
    enemies: {
        enemyType: EnemyType;
        spawnInterval: number;
        count: number;
    }[];
}

@injectable
export class EnemyManager extends Container {
    readonly stageCompleted = new EventEmitter();
    private readonly resizer = inject(Resizer);
    private readonly player = inject(Player);
    private readonly world = inject(World);
    private readonly time = inject(GameTime);

    private readonly enemies = [] as Enemy[];
    private readonly attraction = 1;
    private readonly repulsion = 0.5;
    private readonly friction = 0.5;
    private readonly levelStarts;
    private readonly levels;
    private elapsed = 0;
    private _stageCompleted = false;

    constructor(levels: ISpawnLevel[]) {
        super();

        let start = 0;
        this.levelStarts = levels.map((level) => {
            const end = start + level.duration;
            start = end;
            return end;
        });
        this.levelStarts.unshift(0);

        this.levels = levels.map(
            (level) => new Map(level.enemies.map((enemy) => [enemy.enemyType, { ...enemy, lastSpawned: 0 }])),
        );
    }

    private get currentLevel() {
        const index = this.levelStarts.findLastIndex((start) => this.elapsed / 1000 > start);
        const currentLevel = this.levels[index];
        return currentLevel as typeof currentLevel | undefined;
    }

    restart() {
        for (const zombie of this.enemies) zombie.destroy();
        this.enemies.clear();
        this.elapsed = 0;
        this._stageCompleted = false;
        this.time.remove(this.update);
        this.time.add(this.update);
    }

    pause() {
        this.time.remove(this.update);
    }

    resume() {
        this.time.add(this.update);
    }

    private spawn(enemyType: EnemyType) {
        // Spawn a zombie
        const enemy = this.spawnEnemy(enemyType);

        // Position it outside the screen
        const r = Math.random();
        const vertical = r > 0.5;
        let { width, height } = this.resizer.dimensions;

        // Increase a bit so that they are really off-screen
        width *= 1.2;
        height *= 1.2;

        if (vertical) {
            enemy.y = (Math.sign(r - 0.75) * height) / 2;
            enemy.x = (Math.random() - 0.5) * width;
        } else {
            enemy.x = (Math.sign(r - 0.25) * width) / 2;
            enemy.y = (Math.random() - 0.5) * height;
        }

        this.enemies.push(enemy);
        this.world.spawn(enemy, { tag: "enemy", relative: true });

        enemy.died.subscribe(() => this.onEnemyDied(enemy));
    }

    // Boids-like movement
    private readonly update = (dt: number) => {
        if (this._stageCompleted) return;

        this.elapsed += this.time.ticker.deltaMS;

        const { currentLevel } = this;
        if (currentLevel)
            for (const [enemyType, level] of currentLevel)
                if (level.lastSpawned === 0 || this.elapsed - level.lastSpawned > level.spawnInterval * 1000) {
                    level.lastSpawned = this.elapsed;
                    for (let i = 0; i < level.count; i++) this.spawn(enemyType);
                }

        this.moveEnemies(dt);
    };

    private moveEnemies(dt: number) {
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
    }

    private spawnEnemy(enemyType: EnemyType) {
        if (enemyType === "worker") {
            const enemy = new Enemy({
                sprite: "worker",
                mass: 1,
                hp: 1,
                radius: 10,
                maxSpeed: 1,
            });

            enemy.weapon = new MeleeAttack(enemy, "player", 1, 0, 0.5);

            return enemy;
        } else {
            const enemy = new Enemy({
                sprite: "policeman",
                mass: 2,
                hp: 2,
                radius: 10,
                maxSpeed: 0.8,
            });

            enemy.weapon = new MeleeAttack(enemy, "player", 2, 0, 0.5);

            return enemy;
        }
    }

    private onEnemyDied(enemy: Enemy) {
        this.enemies.remove(enemy);
        this._stageCompleted = this.currentLevel === undefined && this.enemies.isEmpty;
        if (this._stageCompleted) this.stageCompleted.emit();
    }
}
