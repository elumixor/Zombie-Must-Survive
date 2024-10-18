import { EventEmitter } from "@elumixor/frontils";
import {
    arrayEditor,
    groupEditor,
    Handle,
    numberEditor,
    selectEditor,
    sliderEditor,
    stringEditor,
    type ArrayEditor,
} from "game-zombie/config";
import { createView } from "game-zombie/config/create-element";
import { buttonEditor } from "game-zombie/config/editors/button";
import type { IEditor } from "game-zombie/config/editors/editor";
import type { IResetView } from "game-zombie/config/imy-element";
import type { EnemySpineKey } from "game-zombie/resources-zombie";
import type { IEnemyConfig, IEnemyStageConfig, IStageConfig } from "./types";

function stageEnemyEditor(view: IResetView): IEditor<IEnemyStageConfig> {
    return groupEditor(
        view,
        {
            enemyType: (view) => stringEditor(view, { defaultValue: "enemy1" }),
            spawnInterval: (view) => sliderEditor(view, { min: 0.1, max: 60, step: 0.5, defaultValue: 1 }),
            count: (view) => sliderEditor(view, { min: 1, max: 60, step: 1, defaultValue: 5 }),
        },
        {
            enemyType: "enemy1",
            spawnInterval: 1,
            count: 5,
        },
    );
}

function stageEditor(view: IResetView) {
    const editor = groupEditor(
        view,
        {
            duration: (view) => sliderEditor(view, { min: 1, max: 60, step: 1, defaultValue: 15 }),
            enemies: (view) =>
                arrayEditor(view, (view) => stageEnemyEditor(view), {
                    title: (index) => `Enemy ${index + 1}`,
                    defaultValue: { enemyType: "enemy1", spawnInterval: 1, count: 5 },
                }),
        },
        {
            duration: 15,
            enemies: [{ enemyType: "enemy1", spawnInterval: 1, count: 5 }],
        },
    );

    const startStageButton = buttonEditor(createView("Start Stage", editor.view.content));

    return { editor, startStageButton };
}

export const stagesEditor = new (class extends Handle<IStageConfig[]> {
    readonly startStage = new EventEmitter<number>();

    private editor!: ArrayEditor<IStageConfig>;

    protected override addToView(view: IResetView) {
        this.editor = arrayEditor(
            view,
            (view) => {
                const { editor, startStageButton } = stageEditor(view);
                startStageButton.changed.subscribe(() => this.startStage.emit(this.editor.editors.indexOf(editor)));
                return editor;
            },
            {
                title: (index) => `Stage ${index + 1}`,
                defaultValue: { duration: 15, enemies: [] },
            },
        );

        return this.editor;
    }

    protected override updateView(value: IStageConfig[]): void {
        this.editor.update(value);
    }
})();

type EnemiesConfig = Map<string, IEnemyConfig>;
type EnemiesConfigRaw = { enemyType: string; config: IEnemyConfig }[];

function enemyConfigEditor(view: IResetView): IEditor<IEnemyConfig> {
    return groupEditor(
        view,
        {
            speed: (view) => numberEditor(view),
            damage: (view) => numberEditor(view),
            health: (view) => numberEditor(view),
            lag: (view) => numberEditor(view),
            spine: (view) => selectEditor(view, { options: ["villager1", "villager2", "villager3", "butcher", "nun"] }),
        },
        { speed: 1, damage: 1, health: 10, lag: 0.5, spine: "villager1" as EnemySpineKey },
    );
}

export const enemiesEditor = new (class extends Handle<EnemiesConfig, EnemiesConfigRaw> {
    private editor!: IEditor<EnemiesConfigRaw>;

    protected override addToView(view: IResetView) {
        this.editor = arrayEditor(view, (view) =>
            groupEditor(
                view,
                { enemyType: (view) => stringEditor(view), config: enemyConfigEditor },
                {
                    enemyType: "enemy1",
                    config: { speed: 1, damage: 1, health: 10, lag: 0.5, spine: "villager1" } as IEnemyConfig,
                },
            ),
        );

        return this.editor;
    }
    protected override set(value: EnemiesConfigRaw) {
        const v = this.propertyValue;

        console.log(value, v);

        v.clear();
        for (const { enemyType, config } of value) v.set(enemyType, config);
    }

    protected override extractValue(value: EnemiesConfig): EnemiesConfigRaw {
        return Array.from(value.entries()).map(([enemyType, config]) => ({ enemyType, config }));
    }

    protected override updateView(value: EnemiesConfigRaw) {
        this.editor.update(value);
    }
})();
