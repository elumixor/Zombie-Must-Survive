import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IResetView } from "../imy-element";
import type { IEditor } from "./editor";

export interface SelectOptions<T> {
    options: T[];
    defaultValue?: T;
}

export function selectEditor<const T>(
    view: IResetView,
    { options, defaultValue = options.first }: SelectOptions<T>,
): IEditor<T> {
    const select = createElement("select", { className: "editor" });

    for (const option of options) {
        const optionElement = createElement("option", { parent: select });
        optionElement.value = String(option);
        optionElement.textContent = String(option);
    }

    select.value = String(defaultValue);

    const changed = new EventEmitter<T>();

    view.container.appendChild(select);
    select.addEventListener("change", () => changed.emit(options[select.selectedIndex]));

    const update = (value: T) => {
        select.value = String(value);
    };

    return { changed, update, view, resetRequested: view.resetRequested };
}
