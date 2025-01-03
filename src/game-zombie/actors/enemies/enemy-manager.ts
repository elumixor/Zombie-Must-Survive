import { Actor, Vec2 } from "@core";
import { EventEmitter } from "@elumixor/frontils";
import { c } from "game-zombie/config";
import { Enemy } from "./enemy";
import { enemiesEditor, stagesEditor } from "./enemy-manager.editor";
import { Stage } from "./stage";
import type { IEnemyConfig, IStageConfig } from "./types";

@c
export class EnemyManager extends Actor {
    enemiesTarget?: Actor;
    override tickEnabled = false;

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
            enemies: [{ enemyType: "enemy1", spawnInterval: 1, count: 5 }],
        },
    ]);

    @c(enemiesEditor)
    private readonly enemiesConfig = new Map<string, IEnemyConfig>([
        ["enemy1", { speed: 1, damage: 1, health: 10, lookahead: 0.05, scale: 1, xp: 1, spine: "villager1" }],
        ["enemy2", { speed: 1, damage: 1, health: 10, lookahead: 0.05, scale: 1, xp: 1, spine: "villager2" }],
        ["enemy3", { speed: 1, damage: 1, health: 10, lookahead: 0.05, scale: 1, xp: 1, spine: "villager3" }],
    ]);

    private stages = [] as Stage[];

    @c(c.bool())
    private readonly autoStart = true as boolean;

    @c(c.bool())
    private readonly restartOnEnd = false as boolean;

    @c(c.num())
    private readonly spawnDistance = 100 as number;

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

    private spawn(enemyType: string) {
        logs(`Spawning enemy ${enemyType}`, { duration: 1, color: "cyan" });

        // Spawn a zombie
        const enemy = this.createEnemy(enemyType);

        // Position it outside the screen
        this.level.addChild(enemy);
        enemy.worldPosition = this.getSpawnPosition();

        this.enemies.push(enemy);

        // Handle enemy death
        enemy.health.died.subscribeOnce(() => this.onEnemyDied(enemy));
    }

    private createEnemy(enemyType: string) {
        const data = this.enemiesConfig.get(enemyType);
        assert(data, `Enemy type ${enemyType} not found`);

        const { speed, damage, health, lookahead = 0.02, scale = 1, xp = 1, spine: enemySpine } = data;

        const enemy = new Enemy(enemySpine);

        enemy.tracker.target = this.enemiesTarget;

        enemy.tracker.force = speed;
        enemy.tracker.lookahead = lookahead;
        enemy.scale.set(scale);
        enemy.weapon.damage = damage;
        enemy.health.maxHealth = health;
        enemy.health.health = enemy.health.maxHealth;
        enemy.xpFactor = xp;

        return enemy;
    }

    startStage(index: number) {
        this.stopStages();

        const stage = this.stages[index] as Stage | undefined;

        if (!stage) return;
        stage.start();
        logs(`Starting stage ${index + 1}`, { duration: 1, color: "#6fa" });
    }

    private onEnemyDied(enemy: Enemy, destroy = false) {
        this.enemyDied.emit(enemy);
        this.enemies.remove(enemy);

        if (destroy) {
            this.level.removeChild(enemy);
            enemy.destroy();
        }
    }

    override destroy() {
        this.clearEnemies();
        this.stopStages();
        super.destroy();
    }

    private getSpawnPosition() {
        const { screenSize } = this.level;
        const center = screenSize.div(2);
        const maxSize = hypot(center.x, center.y);
        const offset = Vec2.random().withLength(maxSize + this.spawnDistance);
        return this.level.screenToWorld(center.add(offset));
    }

    @c(c.button())
    private clearEnemies() {
        for (const enemy of [...this.enemies]) this.onEnemyDied(enemy, true);
    }

    @c(c.button())
    private stopStages() {
        for (const stage of this.stages) stage.stop();
    }
}
