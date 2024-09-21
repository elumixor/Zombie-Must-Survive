import { numberEditor, sliderEditor, type NumericOptions } from "../editors";
import type { IResetView } from "../imy-element";
import { Handle } from "./handle";

type ExtendedNumericOptions = NumericOptions & {
    slider?: boolean;
};

export class NumericHandle extends Handle<number> {
    private update!: (value: number) => void;

    constructor(protected readonly options: ExtendedNumericOptions = {}) {
        super();
    }

    protected override set(value: number, instance: object) {
        const { min = -Infinity, max = Infinity } = this.options;

        // Clamp
        value = clamp(value, min, max);

        // Round
        value = round(value, this.options.step);

        super.set(value, instance);
    }

    override addToView(view: IResetView) {
        const { changed, update, resetRequested } = this.options.slider
            ? sliderEditor(view, this.options)
            : numberEditor(view, this.options);

        this.update = update;

        return { changed, resetRequested };
    }

    override updateView(value: number) {
        this.update(value);
    }
}

export function num(options?: ExtendedNumericOptions) {
    return new NumericHandle(options);
}
