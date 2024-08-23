import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IHandleView } from "../handles";
import type { IEditor } from "./editor";

export function standardEditor(view: IHandleView): IEditor<string> {
    const input = createElement("input", { className: "editor standard" });

    const changed = new EventEmitter<string>();

    view.view.appendChild(input);
    input.addEventListener("input", () => changed.emit(input.value));

    const update = (value: string) => (input.value = value);

    return { changed, update, view };
}
