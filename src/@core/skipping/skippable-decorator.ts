/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { KeyForValue } from "@elumixor/frontils";
import { makeComplexSkippable } from "./make-complex-skippable";

type F = (...args: unknown[]) => void;
type Arg<T = void> = T extends void ? string | F : string & KeyForValue<T, F>;

/**
 * Skippable decorator with a `onSkip()` handler and `finally()` handlers.
 * Will not propagate by-default, only if the `propagate` option is set to `true`
 */
export function skippable<T = void>(options: { onSkip: Arg<T>; propagate?: true; finally?: Arg<T> }): MethodDecorator;
/**
 * Skippable decorator with a `finally()` handler. Skippable will not propagate.
 */
export function skippable<T = void>(options: { propagate: false; finally: Arg<T> }): MethodDecorator;
/**
 * Skippable decorator that will not propagate
 */
export function skippable(options: { propagate: false }): MethodDecorator;
/**
 * Skippable decorator with a `finally()` handler.
 */
export function skippable<T = void>(options: { finally: Arg<T> }): MethodDecorator;
export function skippable<T = void>(options: { onSkip?: Arg<T>; finally?: Arg<T>; propagate?: boolean }) {
    return function (
        _target: T extends void ? unknown : T,
        _propertyKey: string | symbol,
        propertyDescriptor: PropertyDescriptor,
    ) {
        const original = propertyDescriptor.value as F;

        propertyDescriptor.value = function (this: Partial<Record<string, () => void>>, ...args: unknown[]) {
            const s =
                typeof options.onSkip === "string"
                    ? (this[options.onSkip] as F).bind(this)
                    : options.onSkip?.bind(this);

            const f =
                typeof options.finally === "string"
                    ? (this[options.finally] as F).bind(this)
                    : options.finally?.bind(this);

            const p = options.propagate;

            // Make a complex skippable based on the arguments
            const opt = { onSkip: s, finally: f, propagate: p };

            // Suppressing as the correct calls are ensured by the signature
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const complex = makeComplexSkippable(original.bind(this), opt);
            // store the created complex skippable
            propertyDescriptor.value = complex;

            // Make the actual call
            return complex(...args);
        };
    };
}
