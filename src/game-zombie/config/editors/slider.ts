import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import type { IHandleView } from "../handles";
import "../styles/slider.scss";
import type { IEditor } from "./editor";
import type { NumericOptions } from "./number";

export function sliderEditor(
    view: IHandleView,
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

    view.view.classList.add("slider-container");

    // Append the input element to the container
    view.view.appendChild(sliderInput);

    const regularInput = createElement("input", {
        className: "slider-input-regular",
        parent: view.view,
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

    return { changed, update, view };
}
