import { Actor, Time, Vec2, type Interval, type Timeout } from "@core";
import { di } from "@elumixor/di";
import { EventEmitter } from "@elumixor/frontils";
import { c } from "game-zombie/config";
import { Enemy } from "./enemy";
import { enemiesEditor, stagesEditor } from "./enemy-manager.editor";
import { EnemyType } from "./enemy-type";
import type { IEnemyStageConfig, IStageConfig } from "./types";

class Stage {
    readonly ended = new EventEmitter();
    readonly spawnRequested = new EventEmitter<IEnemyStageConfig>();

    private readonly time = di.inject(Time);
    private timeout?: Timeout;
    private intervals = [] as Interval[];

    constructor(
        public stageConfig: IStageConfig = {
            duration: 1,
            enemies: [],
        },
    ) {}

    start() {
        this.stop();

        this.timeout = this.time.timeout(() => this.end(), this.stageConfig.duration);
        this.intervals = this.stageConfig.enemies.map((enemy) =>
            this.time.interval(() => this.spawnRequested.emit(enemy), enemy.spawnInterval),
        );
    }

    stop() {
        this.timeout?.clear();
        for (const interval of this.intervals) interval.clear();

        this.timeout = undefined;
        this.intervals = [];
    }

    private end() {
        this.stop();
        this.ended.emit();
    }
}

@c
export class EnemyManager extends Actor {
    enemiesTarget?: Actor;
    tickEnabled = false;

    readonly enemyDied = new EventEmitter<Enemy>();

    readonly enemies = [] as Enemy[];

    @c(stagesEditor, {
        onUpdate([instance], value) {
            const i = instance as EnemyManager;
            i.clearEnemies();
            i.calculateStages(value as IStageConfig[]);
        },
        onCreated([instance], _value, handle) {
            handle.startStage.subscribe((index) => {
                const i = instance as EnemyManager;
                i.startStage(index);
            });
        },
    })
    private readonly stagesConfig = range(5).flatMap(() => [
        {
            duration: 15,
            enemies: [{ enemyType: EnemyType.Villager1, spawnInterval: 1, count: 5 }],
        },
    ]);

    @c(enemiesEditor)
    private readonly enemiesConfig = {
        [EnemyType.Villager1]: { speed: 1, damage: 1, health: 10, lag: 0.5 },
        [EnemyType.Villager2]: { speed: 1, damage: 1, health: 10, lag: 0.5 },
        [EnemyType.Villager3]: { speed: 1, damage: 1, health: 10, lag: 0.5 },
    };

    private stages = [] as Stage[];

    @c(c.bool())
    private readonly autoStart = true as boolean;

    override beginPlay() {
        super.beginPlay();

        if (this.autoStart) this.startStage(0);
    }

    calculateStages(stages: IStageConfig[]) {
        for (const stage of this.stages) stage.stop();

        this.stages = stages.map((stageConfig) => new Stage(stageConfig));
        for (const [index, stage] of this.stages.entries()) {
            stage.ended.subscribeOnce(() => {
                logs(`Stage ${index + 1} ended`, { duration: 1, color: "#f6a" });
                this.startStage(index + 1);
            });
            stage.spawnRequested.subscribe((enemyConfig) => {
                for (const _ of range(enemyConfig.count)) this.spawn(enemyConfig.enemyType);
            });
        }
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

    private getEnemy(enemyType: EnemyType) {
        const enemy = new Enemy(enemyType);

        enemy.tracker.target = this.enemiesTarget;

        const { speed, damage, health, lag } = this.enemiesConfig[enemyType];

        enemy.tracker.force = speed;
        enemy.tracker.lag = lag;
        enemy.weapon.damage = damage;
        enemy.health.maxHealth = health;
        enemy.health.health = enemy.health.maxHealth;

        return enemy;
    }

    startStage(index: number) {
        this.stopStages();
        this.stages[index]?.start();

        logs(`Starting stage ${index + 1}`, { duration: 1, color: "#6fa" });
    }

    private onEnemyDied(enemy: Enemy) {
        this.enemyDied.emit(enemy);
        this.enemies.remove(enemy);
    }

    private getSpawnPosition() {
        const { screenSize } = this.level;
        const center = screenSize.div(2);
        const maxSize = max(center.x, center.y);
        const offset = Vec2.random().withLength(maxSize * 1.2);
        return this.level.screenToWorld(center.add(offset));
    }

    @c(c.button())
    private clearEnemies() {
        for (const enemy of [...this.enemies]) {
            enemy.destroy();
            this.onEnemyDied(enemy);
        }
    }

    @c(c.button())
    private stopStages() {
        for (const stage of this.stages) stage.stop();
    }
}
