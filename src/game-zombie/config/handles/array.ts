import { arrayEditor } from "../editors";
import type { IEditor, IEditorFactory } from "../editors/editor";
import type { IResetView } from "../imy-element";
import { Handle } from "./handle";

interface Options<T> {
    title?: (index: number) => string;
    defaultValue?: T;
}

export function arr<T>(elementEditorFactory: IEditorFactory<T>, options?: Options<T>) {
    return new ArrPropHandle(elementEditorFactory, options);
}

class ArrPropHandle<T> extends Handle<T[]> {
    private editor!: IEditor<T[]>;

    constructor(
        private readonly elementEditorFactory: IEditorFactory<T>,
        private readonly options: Options<T> = {},
    ) {
        super();
    }

    protected override addToView(view: IResetView) {
        this.editor = arrayEditor(view, this.elementEditorFactory, {
            title: (index) => `Level ${index + 1}`,
            defaultValue: this.options.defaultValue,
        });

        return this.editor;
    }

    protected override updateView(value: T[]) {
        this.editor.update(value);
    }
}
