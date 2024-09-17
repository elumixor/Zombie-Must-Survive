import { Actor, Vec2 } from "@core";
import { EventEmitter } from "@elumixor/frontils";
import { Player } from "../player";
import { Enemy } from "./enemy";
import type { EnemyType } from "./enemy-type";
import { arrayEditor, c, Handle, selectEditor, sliderEditor, type IHandleView } from "game-zombie/config";
import type { IEditor } from "game-zombie/config/editors/editor";
import { createView } from "game-zombie/config/create-element";

interface IEnemyStageConfig {
    enemyType: EnemyType;
    spawnInterval: number;
    count: number;
}

interface IStage {
    duration: number;
    enemies: IEnemyStageConfig[];
}

function groupEditor<T extends Record<string, unknown>>(
    view: IHandleView,
    editorsCreators: { [K in keyof T]: (view: IHandleView) => IEditor<T[K]> },
    defaultValue: T,
): IEditor<T> {
    const keys = Object.keys(editorsCreators) as (keyof T)[];

    const views = keys.map((key) => {
        const div = createView(String(key), view.view);
        return div;
    });

    const editors = Object.fromEntries(keys.map((key, index) => [key, editorsCreators[key](views[index])]));

    const changed = new EventEmitter<T>();
    const update = (value: T) => {
        for (const key in editors) editors[key].update(value[key] as T[keyof T]);
    };

    for (const key in editors)
        editors[key].changed.subscribe((value) => {
            changed.emit({ ...defaultValue, ...{ [key]: value } });
        });

    return { view, changed, update };
}

function enemyEditor(view: IHandleView): IEditor<IEnemyStageConfig> {
    return groupEditor(
        view,
        {
            enemyType: (view) =>
                selectEditor(view, { options: ["worker", "soldier", "doctor"], defaultValue: "worker" }),
            spawnInterval: (view) => sliderEditor(view, { min: 0.1, max: 60, step: 0.5, defaultValue: 1 }),
            count: (view) => sliderEditor(view, { min: 1, max: 60, step: 1, defaultValue: 5 }),
        },
        {
            enemyType: "worker" as EnemyType,
            spawnInterval: 1,
            count: 5,
        },
    );
}

function stageEditor(view: IHandleView): IEditor<IStage> {
    return groupEditor(
        view,
        {
            duration: (view) => sliderEditor(view, { min: 1, max: 60, step: 1, defaultValue: 15 }),
            enemies: (view) =>
                arrayEditor(view, (view) => enemyEditor(view), {
                    title: (index) => `Stage ${index + 1}`,
                    defaultValue: { enemyType: "worker" as EnemyType, spawnInterval: 1, count: 5 },
                }),
        },
        {
            duration: 15,
            enemies: [{ enemyType: "worker" as EnemyType, spawnInterval: 1, count: 5 }],
        },
    );
}

class StagesEditor extends Handle<IStage[]> {
    private editor!: IEditor<IStage[]>;

    protected override addToView(view: IHandleView): EventEmitter<IStage[]> {
        this.editor = arrayEditor(view, (view) => stageEditor(view), {
            title: (index) => `Stage ${index + 1}`,
            defaultValue: { duration: 15, enemies: [] },
        });

        return this.editor.changed;
    }

    protected override updateView(value: IStage[]): void {
        this.editor.update(value);
    }
}
const stagesEditor = new StagesEditor();

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
