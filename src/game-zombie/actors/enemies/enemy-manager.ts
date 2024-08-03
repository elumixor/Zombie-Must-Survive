import { Actor, Resizer, Vec2 } from "@core";
import { inject } from "@core/di";
import { EventEmitter } from "@elumixor/frontils";
// import { MeleeAttack } from "game-zombie/components/weapons";
import { Texture } from "pixi.js";
import { Player } from "../player";
import { Enemy } from "./enemy";
// import { World } from "../world";

export type EnemyType = "worker" | "soldier";

interface IStage {
    duration: number;
    enemies: {
        enemyType: EnemyType;
        spawnInterval: number;
        count: number;
    }[];
}

export class EnemyManager extends Actor {
    player?: Player;

    readonly stageCompleted = new EventEmitter();
    private readonly resizer = inject(Resizer);

    private readonly enemies = [] as Enemy[];
    private readonly stageStarts;
    private readonly stages;
    private elapsed = 0;
    private _stageCompleted = false;

    constructor(stages: IStage[]) {
        super();

        let start = 0;
        this.stageStarts = stages.map((level) => {
            const end = start + level.duration;
            start = end;
            return end;
        });

        this.stageStarts.unshift(0);

        this.stages = stages.map(
            (stage) => new Map(stage.enemies.map((enemy) => [enemy.enemyType, { ...enemy, lastSpawned: 0 }])),
        );

        this.name = "EnemyManager";
    }

    private get stage() {
        const index = this.stageStarts.findLastIndex((start) => this.elapsed / 1000 > start);
        const currentLevel = this.stages[index];
        return currentLevel as typeof currentLevel | undefined;
    }

    private spawn(enemyType: EnemyType) {
        logs(`Spawning enemy ${enemyType}`, { color: "cyan" });

        // Spawn a zombie
        const enemy = this.getEnemy(enemyType);

        // Position it outside the screen
        this.level.addChild(enemy);
        enemy.worldPosition = this.getSpawnPosition();

        this.enemies.push(enemy);

        // Handle enemy death
        enemy.health.died.subscribeOnce(() => this.onEnemyDied(enemy));
    }

    override update() {
        this.elapsed += this.time.dMs;

        const { stage } = this;
        if (stage)
            for (const [enemyType, level] of stage)
                if (level.lastSpawned === 0 || this.elapsed - level.lastSpawned > level.spawnInterval * 1000) {
                    level.lastSpawned = this.elapsed;
                    for (let i = 0; i < level.count; i++) this.spawn(enemyType);
                }
    }

    private getEnemy(enemyType: EnemyType) {
        const enemy = new Enemy();

        enemy.tracker.target = this.player;

        if (enemyType === "soldier") {
            enemy.sprite.texture = Texture.from("policeman");
            enemy.tracker.speed = 4;
            enemy.weapon.damage = 3;
            enemy.health.maxHealth = 20;
            enemy.health.health = enemy.health.maxHealth;
        }

        return enemy;
    }

    private onEnemyDied(enemy: Enemy) {
        this.enemies.remove(enemy);
        this._stageCompleted = this.enemies.isEmpty;
        if (this._stageCompleted) {
            this.tickEnabled = false;
            this.stageCompleted.emit();
        }
    }

    protected getSpawnPosition() {
        const { width, height } = this.resizer.dimensions;
        const center = new Vec2(width / 2, height / 2);
        const maxSize = max(center.x, center.y);
        const offset = Vec2.random.withLength(maxSize * 1.2);
        return this.level.screenToWorld(center.add(offset));
    }
}
