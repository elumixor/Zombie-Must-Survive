import type { EventEmitter } from "@elumixor/frontils";
import type { IHandleView } from "../handles";

export interface IEditor<T> {
    view: IHandleView;
    readonly changed: EventEmitter<T>;
    update(value: T): void;
}

export type IEditorFactory<T> = (view: IHandleView) => IEditor<T>;
