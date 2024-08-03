import { inject } from "@core/di";
import { Time } from "@core/time";
import { Color } from "pixi.js";

/**
 * Smoothly change a number from one value to another in a given duration and execute a callback at each step.
 * @param start The starting value.
 * @param end The ending value.
 * @param duration The duration of the tween.
 * @param onUpdate A function to call at each step.
 */
export function tweenNumber(
    start: number,
    end: number,
    duration: number,
    onUpdate: (value: number) => void,
    vars = {} as gsap.TweenVars,
) {
    const target = { value: start };
    const time = inject(Time);

    return time.to(target, {
        value: end,
        duration,
        onUpdateParams: [target],
        onUpdate: ({ value }: { value: number }) => onUpdate(value),
        ...vars,
    });
}

export function tween01(duration: number, callback: (t: number) => void, vars = {} as gsap.TweenVars) {
    return tweenNumber(0, 1, duration, callback, vars);
}

export function tweenHEX(
    start: number,
    end: number,
    duration: number,
    onUpdate: (value: number) => void,
    vars = {} as gsap.TweenVars,
) {
    const { r, g, b } = new Color(start).toRgb();
    const { r: tr, g: tg, b: tb } = new Color(end).toRgb();

    return tweenNumber(
        0,
        1,
        duration,
        (t: number) => {
            const color = new Color({
                r: round((r + (tr - r) * t) * 255),
                g: round((g + (tg - g) * t) * 255),
                b: round((b + (tb - b) * t) * 255),
            });

            onUpdate(color.toNumber());
        },
        vars,
    );
}
