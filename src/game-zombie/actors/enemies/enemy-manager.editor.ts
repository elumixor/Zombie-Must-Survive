import { arrayEditor, groupEditor, Handle, selectEditor, sliderEditor } from "game-zombie/config";
import type { IEditor } from "game-zombie/config/editors/editor";
import type { IResetView } from "game-zombie/config/imy-element";
import type { EnemyType } from "./enemy-type";
import type { IEnemyStageConfig, IStage } from "./types";

function enemyEditor(view: IResetView): IEditor<IEnemyStageConfig> {
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

function stageEditor(view: IResetView): IEditor<IStage> {
    return groupEditor(
        view,
        {
            duration: (view) => sliderEditor(view, { min: 1, max: 60, step: 1, defaultValue: 15 }),
            enemies: (view) =>
                arrayEditor(view, (view) => enemyEditor(view), {
                    title: (index) => `Enemy ${index + 1}`,
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

    protected override addToView(view: IResetView) {
        this.editor = arrayEditor(view, (view) => stageEditor(view), {
            title: (index) => `Stage ${index + 1}`,
            defaultValue: { duration: 15, enemies: [] },
        });

        return this.editor;
    }

    protected override updateView(value: IStage[]): void {
        this.editor.update(value);
    }
}

export const stagesEditor = new StagesEditor();
