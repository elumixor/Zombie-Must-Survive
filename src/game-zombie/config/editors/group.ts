import { EventEmitter } from "@elumixor/frontils";
import { createView } from "../create-element";
import type { IResetView } from "../imy-element";
import type { ArrayButtonContainer, IEditor } from "./editor";
import { Toggle } from "../toggle";
import { transformText } from "../transform-text";

export function groupEditor<T extends Record<string, unknown>>(
    view: IResetView,
    editorsCreators: { [K in keyof T]: (view: IResetView) => IEditor<T[K]> },
    defaultValue: T,
): IEditor<T> & ArrayButtonContainer {
    const keys = Object.keys(editorsCreators) as (keyof T)[];

    const toggle = new Toggle(transformText(view.title), { open: true, parent: view.content });
    const toggles = keys.map((key) => createView(String(key), toggle.content));
    const editors = Object.fromEntries(keys.map((key, index) => [key, editorsCreators[key](toggles[index])]));

    view.header.style.display = "none";
    toggle.container.classList.add("w-full");
    toggle.header.classList.add("array-header");

    const changed = new EventEmitter<T>();
    const resetRequested = new EventEmitter();

    const update = (value: T) => {
        for (const key in editors) editors[key].update(value[key] as T[keyof T]);
    };

    for (const key in editors) {
        const editor = editors[key];
        editor.changed.subscribe((value) => changed.emit({ ...defaultValue, ...{ [key]: value } }));
        editor.resetRequested.subscribe(() => resetRequested.emit());
    }

    return { view, changed, update, arrayButtonContainer: toggle.header, resetRequested };
}
