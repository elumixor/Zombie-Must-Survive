import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IEditor } from "./editor";
import type { IHandleView } from "../imy-element";

export interface SelectOptions<T> {
    options?: T[];
    defaultValue?: T;
}

export function selectEditor<const T>(view: IHandleView, { options, defaultValue }: SelectOptions<T> = {}): IEditor<T> {
    const select = createElement("select", { className: "editor" });

    if (options) {
        for (const option of options) {
            const optionElement = createElement("option", { parent: select });
            optionElement.value = String(option);
            optionElement.textContent = String(option);
        }
    }

    if (defaultValue) select.value = String(defaultValue);

    const changed = new EventEmitter<T>();

    view.container.appendChild(select);
    select.addEventListener("change", () => changed.emit(options![select.selectedIndex]));

    const update = (value: T) => {
        select.value = String(value);
    };

    return { changed, update, view };
}
