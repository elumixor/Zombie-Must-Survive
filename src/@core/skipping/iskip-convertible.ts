import type { ISkippable } from "./iskippable";

export interface ISkipConvertible<R = void> {
    asSkippable(options?: { propagate: false }): ISkippable<R>;
}
