import type { Awaitable } from "@elumixor/frontils";
import { isSkipError } from "./skip-error";

type F = (...args: unknown[]) => Awaitable;

/**
 * Creates a skippable with a `onSkip()` handler and `finally()` handlers.
 * Will not propagate by-default, only if the `propagate` option is set to `true`
 */
export function makeComplexSkippable(f: F, options: { onSkip: F; propagate?: true; finally?: F }): F;
/**
 * Creates a skippable with a `finally()` handler. Skippable will not propagate.
 */
export function makeComplexSkippable(f: F, options: { propagate: false; finally: F }): F;
/**
 * Creates a skippable that will not propagate
 */
export function makeComplexSkippable(f: F, options: { propagate: false }): F;
/**
 * Creates a skippable with a `finally()` handler.
 */
export function makeComplexSkippable(f: F, options: { finally: F }): F;
export function makeComplexSkippable(f: F, options: { onSkip?: F; finally?: F; propagate?: boolean }) {
    // Note: uncomment the "ignore next" during testing
    /* istanbul ignore next */
    return async (...args: unknown[]) => {
        try {
            // Run the actual function
            // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
            return await f(...args);
        } catch (e) {
            // We only want to handle skip errors.
            // For the others we will re-throw not to miss anything important
            if (!isSkipError(e)) throw e;

            // If the skip handler is specified, we will run it
            if (options.onSkip) {
                await options.onSkip();

                // By-default we will not propagate if the skip handler is specified.
                // We only propagate if the propagate option is set to true.
                if (options.propagate) throw e;
            } else if (options.propagate !== false)
                // If there was no skip handler, we propagate by-default,
                // unless the propagate option was explicitly set to false
                throw e;
        } finally {
            await options.finally?.();
        }
    };
}
