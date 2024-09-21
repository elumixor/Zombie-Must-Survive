import {
    arrayEditor,
    groupEditor,
    Handle,
    numberEditor,
    selectEditor,
    sliderEditor,
    type ArrayEditor,
} from "game-zombie/config";
import type { IEditor } from "game-zombie/config/editors/editor";
import type { IResetView } from "game-zombie/config/imy-element";
import { EnemyType } from "./enemy-type";
import type { IEnemyConfig, IEnemyStageConfig, IStageConfig } from "./types";
import { buttonEditor } from "game-zombie/config/editors/button";
import { createView } from "game-zombie/config/create-element";
import { EventEmitter } from "@elumixor/frontils";

function stageEnemyEditor(view: IResetView): IEditor<IEnemyStageConfig> {
    return groupEditor(
        view,
        {
            enemyType: (view) =>
                selectEditor(view, {
                    options: [EnemyType.Villager1, EnemyType.Villager2, EnemyType.Villager3],
                }),
            spawnInterval: (view) => sliderEditor(view, { min: 0.1, max: 60, step: 0.5, defaultValue: 1 }),
            count: (view) => sliderEditor(view, { min: 1, max: 60, step: 1, defaultValue: 5 }),
        },
        {
            enemyType: EnemyType.Villager1,
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
                    defaultValue: { enemyType: EnemyType.Villager1, spawnInterval: 1, count: 5 },
                }),
        },
        {
            duration: 15,
            enemies: [{ enemyType: EnemyType.Villager1, spawnInterval: 1, count: 5 }],
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

type EnemiesConfig = Record<EnemyType, IEnemyConfig>;

function enemyConfigEditor(view: IResetView): IEditor<IEnemyConfig> {
    return groupEditor(
        view,
        {
            speed: (view) => numberEditor(view),
            damage: (view) => numberEditor(view),
            health: (view) => numberEditor(view),
            lag: (view) => numberEditor(view),
        },
        { speed: 1, damage: 1, health: 10, lag: 0.5 },
    );
}

export const enemiesEditor = new (class extends Handle<EnemiesConfig> {
    private editor!: IEditor<EnemiesConfig>;

    protected override addToView(view: IResetView) {
        // Map all enum values to their respective editor
        const values = Object.values(EnemyType);

        this.editor = groupEditor(
            view,
            Object.fromEntries(values.map((value) => [value, (view) => enemyConfigEditor(view)])) as Record<
                EnemyType,
                (view: IResetView) => IEditor<IEnemyConfig>
            >,
            Object.fromEntries(
                values.map((value) => [value, { speed: 1, damage: 1, health: 10, lag: 0.5 }]),
            ) as EnemiesConfig,
        );

        return this.editor;
    }

    protected override updateView(value: { [key in EnemyType]: IEnemyConfig }): void {
        this.editor.update(value);
    }
})();
