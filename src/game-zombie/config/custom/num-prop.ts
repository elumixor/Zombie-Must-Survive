import { EventEmitter } from "@elumixor/frontils";
import { arrayEditor, Handle, sliderEditor, type IHandleView } from "game-zombie/config";
import type { IEditor } from "game-zombie/config/editors/editor";
import type { NumProperty } from "game-zombie/skills/skill-property";

export function numProp(options?: { min?: number; max?: number; rounding?: number; defaultValue?: number }) {
    return new NumPropHandle(options);
}

class NumPropHandle extends Handle<NumProperty, number[]> {
    private editor!: IEditor<number[]>;

    constructor(
        private readonly options: { min?: number; max?: number; rounding?: number; defaultValue?: number } = {},
    ) {
        super();
    }

    protected override set(value: number[]) {
        this.propertyValue.values = value;
    }
    protected override extractValue(value: NumProperty): number[] {
        return value.values;
    }

    protected override addToView(view: IHandleView): EventEmitter<number[]> {
        this.editor = arrayEditor(
            view,
            (view) =>
                sliderEditor(view, this.options.min ?? -100, this.options.max ?? 100, this.options.rounding ?? 0.5),
            {
                title: (index) => `Level ${index + 1}`,
                defaultValue: this.options.defaultValue ?? 0,
            },
        );

        return this.editor.changed;
    }

    protected override updateView(value: number[]): void {
        this.editor.update(value);
    }
}
