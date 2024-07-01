import { SkipError } from "./skip-error";
import type { ISkippable } from "./iskippable";
import { pushNewSkippable, removeFromStack } from "./skippable-stack";

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __ENVIRONMENT__: {
    readonly production?: boolean;
};

export function makeSkippable<G extends PromiseLike<unknown> = PromiseLike<unknown>>(
    executor: G,
    skip: () => void,
    propagate?: false,
) {
    let _reject: (reason: unknown) => void;

    const stack = __ENVIRONMENT__.production ? "" : new Error().stack;

    // Create a promise
    const promise = new Promise<unknown>((resolve, reject) => {
        // capture the reject() and make it visible to the outside
        _reject = reject;

        // resolve the promise when the executor resolves
        void executor.then(resolve, reject);
    });

    const then = promise.then.bind(promise);
    const c = promise.catch.bind(promise);
    const f = promise.finally.bind(promise);

    function skipFunction() {
        // Run the skip handler
        skip();

        // If we don't propagate, the promise will simply be resolved
        // otherwise we will reject to propagate the error further on
        if (propagate !== false)
            // We could also resolve the promise instead of rejecting,
            // however, rejecting allows us to create a specific handling
            // of skipping
            (_reject as (reason: unknown) => void)(new SkipError(stack));
    }

    // We return a proxy to redirect the "then" to the created promise
    // and all the other calls to the executor
    const result = new Proxy(executor, {
        get(target: G, p: string | symbol) {
            switch (p) {
                case "then":
                    return then;
                case "catch":
                    return c;
                case "finally":
                    return f;
                case "skip":
                    return skipFunction;
                case "stopPropagation":
                    return () => {
                        propagate = false;
                        return result;
                    };
                default:
                    return target[p as keyof G];
            }
        },
    }) as G & ISkippable<G extends PromiseLike<infer R> ? R : never>;

    // If `watch` is set to false, then we don't push the skippable to the stack
    // we simply return the promise with the skip handler
    void promise.then(
        () => removeFromStack(result),
        () => undefined,
    );

    pushNewSkippable(result);

    return result;
}
