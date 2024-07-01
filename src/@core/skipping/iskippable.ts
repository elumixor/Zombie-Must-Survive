/**
 * Base interface for the skippables: `Promise` with a `skip()` method.
 */
export interface ISkippable<T = void> extends Promise<T> {
    /**
     * Should interrupt the promise's execution, which makes it resolve instantly
     */
    skip(): void;
    /**
     * Stops the propagation of the skip error
     */
    stopPropagation(): this;
}
