import { Actor, Vec2 } from "@core";
import { EventEmitter } from "@elumixor/frontils";
import { Player } from "../player";
import { Enemy } from "./enemy";
import type { EnemyType } from "./enemy-type";
import { c } from "game-zombie/config";
import { stagesEditor } from "./enemy-manager.editor";
import type { IStage } from "./types";

@c
export class EnemyManager extends Actor {
    player?: Player;

    readonly stageCompleted = new EventEmitter();
    readonly enemyDied = new EventEmitter<Enemy>();

    readonly enemies = [] as Enemy[];

    private stageStarts = [] as number[];

    @c(stagesEditor, {
        onUpdate([instance], value) {
            (instance as EnemyManager).calculateStages(value as IStage[]);
        },
    })
    private readonly stagesConfig = range(5).flatMap(() => [
        {
            duration: 15,
            enemies: [{ enemyType: "worker" as EnemyType, spawnInterval: 1, count: 5 }],
        },
    ]);
    private stages = [] as Map<EnemyType, { spawnInterval: number; count: number; lastSpawned: number }>[];

    private elapsed = 0;
    private _stageCompleted = false;

    constructor() {
        super();

        this.calculateStages(this.stagesConfig);

        this.name = "EnemyManager";
    }

    calculateStages(stages: IStage[]) {
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

        this.elapsed = 0;
    }

    private get stage() {
        const index = this.stageStarts.findLastIndex((start) => this.elapsed / 1000 > start);
        const currentLevel = this.stages[index];
        return currentLevel as typeof currentLevel | undefined;
    }

    private spawn(enemyType: EnemyType) {
        logs(`Spawning enemy ${enemyType}`, { duration: 1, color: "cyan" });

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
        const enemy = new Enemy(enemyType);

        enemy.tracker.target = this.player;

        if (enemyType === "worker") {
            enemy.tracker.force = 5;
        }

        if (enemyType === "doctor") {
            enemy.tracker.force = 3;
            enemy.weapon.damage = 5;
            enemy.health.maxHealth = 10;
            enemy.health.health = enemy.health.maxHealth;
        }

        if (enemyType === "soldier") {
            enemy.tracker.force = 7;
            enemy.tracker.lag = 1;
            enemy.weapon.damage = 3;
            enemy.health.maxHealth = 20;
            enemy.health.health = enemy.health.maxHealth;
        }

        return enemy;
    }

    private onEnemyDied(enemy: Enemy) {
        this.enemyDied.emit(enemy);
        this.enemies.remove(enemy);
        this._stageCompleted = this.enemies.isEmpty;
        if (this._stageCompleted) {
            this.tickEnabled = false;
            this.stageCompleted.emit();
        }
    }

    protected getSpawnPosition() {
        const { screenSize } = this.level;
        const center = screenSize.div(2);
        const maxSize = max(center.x, center.y);
        const offset = Vec2.random().withLength(maxSize * 1.2);
        return this.level.screenToWorld(center.add(offset));
    }
}
