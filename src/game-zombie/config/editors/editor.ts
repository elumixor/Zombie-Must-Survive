import type { EventEmitter } from "@elumixor/frontils";
import type { IHandleView, IResetView } from "../imy-element";

export interface IEditor<T> {
    view: IHandleView;
    readonly changed: EventEmitter<T>;
    readonly resetRequested: EventEmitter;
    update: (value: T) => void;
}

export type IEditorFactory<T> = (view: IResetView) => IEditor<T>;

export interface ArrayButtonContainer {
    arrayButtonContainer: HTMLElement;
}
