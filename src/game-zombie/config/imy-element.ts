import type { EventEmitter } from "@elumixor/frontils";

export interface IMyElement {
    title: string;
    readonly container: HTMLElement;
    addChild(child: IMyElement): void;
}

export interface IHandleView extends IMyElement {
    readonly header: HTMLElement;
    readonly content: HTMLElement;
}
export interface IResetView extends IHandleView {
    readonly resetRequested: EventEmitter;
}

export interface IToggleElement extends IHandleView {
    addChild(child: IMyElement, path?: string): void;
    getChild(name: string): IMyElement | undefined;
}
