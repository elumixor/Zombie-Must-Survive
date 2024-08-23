import { createElement, createView } from "./create-element";
import type { Handle } from "./handles";
import "./styles/group.scss";

export class Group {
    readonly container = createElement("div", { className: "group" });

    private readonly title = createElement("h3", { className: "header", parent: this.container });
    private readonly view = createElement("div", { parent: this.container });

    readonly handles = new Set<Handle>();

    constructor(readonly name: string) {
        this.title.textContent = name;
    }

    createView(propertyName: string) {
        const view = createView(propertyName, this.view);
        return {
            ...view,
            addHandle: this.addHandle,
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly addHandle = (handle: Handle<any, any>) => this.handles.add(handle);
}
