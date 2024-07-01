import type { KeyForValue } from "@elumixor/frontils";
import type { BaseResources } from "../resources";
import type { SpineParameters } from "./ispine-parameters";
import { spineMetadataSymbol } from "./spine-metadata";
import type { Spine } from "@core/spine";
import { addMetadata } from "@core/utils";
import { Requireable } from "@core/utils/requireable";

/**
 * Decorator to add spine animations.
 * @param fileName Name of the spine animation.
 *                 For example, "symbol1" -> will look in "games_assets/${game_name}/spine_animations/symbol1.json"
 * @param config Configuration for the spine animation.
 */
export function spine(fileName: string, config: SpineParameters = {}) {
    return function <T extends BaseResources>(target: T, propertyKey: KeyForValue<T, Spine> & string) {
        // Part 1: Emit metadata: spine file name and config
        addMetadata(target, spineMetadataSymbol, { fileName, propertyKey, ...config }, { overrideBy: "propertyKey" });

        // Part 2: Return the actual spine (either from the pool or not), when accessing the property via the propertyKey
        const makePool = config.max !== undefined || config.amount !== undefined;
        Reflect.defineProperty(target, propertyKey, {
            get(this: T) {
                // Get the deferred that corresponds with the pool of the spines
                const eventEmitter = this.spinePools.get(propertyKey);
                const pool = eventEmitter.value;

                // If the deferred was resolved, then pool is defined, and resource is loaded
                if (pool) {
                    if (makePool) {
                        // Cache the deferred
                        Reflect.defineProperty(target, propertyKey, {
                            get() {
                                return Requireable.wrap(pool.obtain());
                            },
                        });

                        // Remember to return then original result
                        return Requireable.wrap(pool.obtain());
                    }

                    // If there's no need for pooling
                    const value = Requireable.wrap(pool.obtain());

                    // Cache the result
                    Reflect.defineProperty(target, propertyKey, { value });

                    // Return it
                    return value;
                }

                throw new Error(`Spine "${fileName}" is not loaded yet`);
            },
            configurable: true,
        });
    };
}
