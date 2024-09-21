import { Actor, Vec2 } from "@core";
import { EventEmitter } from "@elumixor/frontils";
import { c } from "game-zombie/config";
import { Enemy } from "./enemy";
import { enemiesEditor, stagesEditor } from "./enemy-manager.editor";
import { EnemyType } from "./enemy-type";
import type { IStageConfig } from "./types";
import { Stage } from "./stage";

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
    @c(c.bool())
    private readonly restartOnEnd = false as boolean;

    override beginPlay() {
        super.beginPlay();

        if (this.autoStart) this.startStage(0);
    }

    calculateStages(stages: IStageConfig[]) {
        for (const stage of this.stages) stage.stop();

        this.stages = stages.map((stageConfig) => new Stage(stageConfig));
        for (const [index, stage] of this.stages.entries()) {
            stage.ended.subscribe(() => {
                logs(`Stage ${index + 1} ended`, { duration: 1, color: "#f6a" });

                let nextIndex = this.stages.indexOf(stage) + 1;
                if (nextIndex >= this.stages.length && this.restartOnEnd) nextIndex = 0;
                this.startStage(nextIndex);
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

        const stage = this.stages[index] as Stage | undefined;

        if (!stage) return;
        stage.start();
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
