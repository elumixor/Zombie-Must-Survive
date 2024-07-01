/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type { ISkipConvertible } from "./iskip-convertible";

type Arg = ISkipConvertible<unknown> | void | undefined;

type SkippableReturn<T> = T extends undefined
    ? undefined
    : T extends void
      ? void
      : T extends ISkipConvertible<unknown>
        ? ReturnType<T["asSkippable"]>
        : never;

export function asSkippable<T extends Arg>(arg: T, options?: { propagate: false }) {
    if (typeof arg === "undefined") return undefined as SkippableReturn<T>;

    return arg.asSkippable(options) as SkippableReturn<T>;
}
