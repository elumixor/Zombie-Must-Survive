import { EventEmitter } from "@elumixor/frontils";
import type { ISkippable } from "./iskippable";

export const skipped = new EventEmitter();

let stack: ISkippable<unknown>[] = [];

export function pushNewSkippable(skippable: ISkippable<unknown>) {
    stack.push(skippable);
}

export function skipCurrent() {
    for (const skippable of stack) skippable.skip();
    stack = [];
    skipped.emit();
}

export function removeFromStack(skippable: ISkippable<unknown>) {
    const index = stack.indexOf(skippable);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    stack.splice(index, 1);
}
