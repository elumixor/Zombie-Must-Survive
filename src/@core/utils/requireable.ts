// eslint-disable-next-line @typescript-eslint/naming-convention
export interface Requireable {
    /**
     * Returns a promise, that is resolved when resource is loaded.
     *
     * @param showLoadingPopup If `true`, a loading popup will be shown.
     *
     * @returns Promise, that is resolved when resource is loaded.
     * The return value (`true`/`false`) can be used to determine if the resource was loaded for the first time:
     * - If resolved to `true`, the resource was loaded for the first time.
     * - If resolved to `false`, the resource was already loaded.
     *
     * @example
     * const requireable = someFunctionThatReturnsARequireable();
     *
     * if (await requireable.require()) {
     *    // The resource was loaded for the first time.
     *    ...
     * }
     *
     * // Do something with the loaded resource.
     * ...
     */
    require(showLoadingPopup?: false): PromiseLike<boolean>;

    /**
     * Returns `true` if resource is loaded, `false` otherwise
     */
    get isPresent(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Requireable {
    /**
     * Adds properties to an object to make in conform to the IRequireable interface.
     * @param obj The object to add properties to.
     */
    export function wrap<T extends object>(obj: T) {
        Reflect.defineProperty(obj, "require", {
            get() {
                Reflect.defineProperty(obj, "require", {
                    value() {
                        return Promise.resolve(false);
                    },
                });

                return () => Promise.resolve(true);
            },
            configurable: true,
        });

        Reflect.defineProperty(obj, "isPresent", {
            value: true,
            writable: false,
        });

        return obj as T & Requireable;
    }
}
