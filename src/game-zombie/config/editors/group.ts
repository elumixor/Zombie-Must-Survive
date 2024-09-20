import { EventEmitter } from "@elumixor/frontils";
import { createView } from "../create-element";
import type { IHandleView } from "../imy-element";
import type { ArrayButtonContainer, IEditor } from "./editor";
import { Toggle } from "../toggle";

export function groupEditor<T extends Record<string, unknown>>(
    view: IHandleView,
    editorsCreators: { [K in keyof T]: (view: IHandleView) => IEditor<T[K]> },
    defaultValue: T,
): IEditor<T> & ArrayButtonContainer {
    const keys = Object.keys(editorsCreators) as (keyof T)[];

    const toggle = new Toggle(view.title, { open: true, parent: view.content });
    const toggles = keys.map((key) => createView(String(key), toggle.content));
    const editors = Object.fromEntries(keys.map((key, index) => [key, editorsCreators[key](toggles[index])]));

    view.header.style.display = "none";
    toggle.container.classList.add("w-full");
    toggle.header.classList.add("array-header");

    const changed = new EventEmitter<T>();
    const update = (value: T) => {
        for (const key in editors) editors[key].update(value[key] as T[keyof T]);
    };

    for (const key in editors)
        editors[key].changed.subscribe((value) => {
            changed.emit({ ...defaultValue, ...{ [key]: value } });
        });

    return { view, changed, update, arrayButtonContainer: toggle.header };
}
