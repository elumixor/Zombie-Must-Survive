import { EventEmitter } from "@elumixor/frontils";
import { createElement } from "../create-element";
import { Handle, type IHandleView } from "./handle";
import "./numeric.scss";

interface NumericOptions {
    slider?: boolean;
    min?: number;
    max?: number;
    rounding?: number;
}

export class NumericHandle extends Handle<number> {
    private input!: HTMLInputElement;

    constructor(protected readonly options: NumericOptions = {}) {
        super();
    }

    protected override set(value: number) {
        const { min = -Infinity, max = Infinity } = this.options;

        // Clamp
        value = clamp(value, min, max);

        // Round
        value = round(value, this.options.rounding);

        super.set(value);
    }

    override addToView(view: IHandleView) {
        this.input = createElement("input", { className: "handle numeric" });
        this.input.type = "number";
        this.input.step = this.options.rounding?.toString() ?? "any";
        this.input.value = "0";

        const viewChanged = new EventEmitter<number>();

        view.view.appendChild(this.input);
        this.input.addEventListener("input", () => viewChanged.emit(parseFloat(this.input.value)));

        return viewChanged;
    }

    override updateView(value: number) {
        this.input.value = value.toString();
    }
}

export function num(options?: NumericOptions) {
    return new NumericHandle(options);
}
