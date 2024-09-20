import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IEditor } from "./editor";
import type { IHandleView } from "../imy-element";
import "./number.scss";

export interface NumericOptions {
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
}

export function numberEditor(
    view: IHandleView,
    { min, max, step, defaultValue = 0 }: NumericOptions = {},
): IEditor<number> {
    const input = createElement("input", { className: "editor number" });
    input.type = "number";

    if (min !== undefined) input.min = min.toString();
    if (max !== undefined) input.max = max.toString();
    if (step !== undefined) input.step = step.toString();

    input.value = String(defaultValue);

    const changed = new EventEmitter<number>();

    view.content.appendChild(input);
    input.addEventListener("input", () => changed.emit(Number(input.value)));

    const update = (value: number) => (input.value = String(value));

    return { changed, update, view };
}
