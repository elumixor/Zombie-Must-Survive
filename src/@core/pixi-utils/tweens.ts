import { gsap } from "gsap";

/**
 * Smoothly change a number from one value to another in a given duration and execute a callback at each step.
 * @param start The starting value.
 * @param end The ending value.
 * @param duration The duration of the tween.
 * @param onUpdate A function to call at each step.
 * @param vars Additional {@link gsap.TweenVars} to pass to the tween.
 */
export function tweenNumber(
    start: number,
    end: number,
    duration: number,
    onUpdate: (value: number) => void,
    vars = {} as gsap.TweenVars,
) {
    const target = { value: start };

    return gsap.to(target, {
        value: end,
        duration,
        onUpdateParams: [target],
        onUpdate: ({ value }: { value: number }) => onUpdate(value),
        ...vars,
    });
}
