import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IResetView } from "../imy-element";
import type { IEditor } from "./editor";
import type { NumericOptions } from "./number";
import "./slider.scss";

export function sliderEditor(
    view: IResetView,
    { min = -10, max = 10, step = 0.5, defaultValue = 0 }: NumericOptions,
): IEditor<number> {
    // Create the input element for the slider
    const sliderInput = createElement("input", {
        className: "slider-input",
    });

    sliderInput.type = "range";
    sliderInput.min = min.toString();
    sliderInput.max = max.toString();
    sliderInput.step = step.toString();

    view.content.classList.add("slider-content");

    // Append the input element to the container
    view.content.appendChild(sliderInput);

    const regularInput = createElement("input", {
        className: "slider-input-regular",
        parent: view.content,
    });

    regularInput.type = "number";
    regularInput.min = min.toString();
    regularInput.max = max.toString();
    regularInput.step = step.toString();
    regularInput.value = defaultValue.toString();

    // Create an event emitter
    const changed = new EventEmitter<number>();

    // Add an event listener to handle changes
    sliderInput.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        changed.emit(value);

        regularInput.value = value.toString();
    });
    regularInput.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        changed.emit(value);

        sliderInput.value = value.toString();
    });

    const update = (value: number) => {
        sliderInput.value = value.toString();
        regularInput.value = value.toString();
    };

    return { changed, update, view, resetRequested: view.resetRequested };
}
