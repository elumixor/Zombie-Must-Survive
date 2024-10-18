import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IResetView } from "../imy-element";
import type { IEditor } from "./editor";

export function stringEditor(view: IResetView, { defaultValue = "" } = {}): IEditor<string> {
    const input = createElement("input", { className: "editor string" });

    input.value = defaultValue;

    const changed = new EventEmitter<string>();

    view.content.appendChild(input);
    input.addEventListener("input", () => changed.emit(input.value));

    const update = (value: string) => (input.value = value);

    return { changed, update, view, resetRequested: view.resetRequested };
}
