import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IResetView } from "../imy-element";
import type { IEditor } from "./editor";
import { Handle } from "../handles";

export function boolEditor(view: IResetView, { defaultValue = false } = {}): IEditor<boolean> {
    const input = createElement("input", { className: "editor number" });
    input.type = "checkbox";

    input.value = String(defaultValue);

    const changed = new EventEmitter<boolean>();

    view.content.appendChild(input);
    input.addEventListener("input", () => changed.emit(input.checked));

    const update = (value: boolean) => (input.checked = value);

    return { changed, update, view, resetRequested: view.resetRequested };
}

export const bool = Handle.create(boolEditor);
