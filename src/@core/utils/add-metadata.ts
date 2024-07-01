import "reflect-metadata";

interface IOptions<V> {
    /**
     * The key in `metadataValue` to override by. This will make sure there are no values with the same key.
     */
    overrideBy?: keyof V | (keyof V)[];
}

/**
 * Adds metadata to the array which corresponds to the spine key. If there is no array, it creates one.
 * @param target The class prototype to add metadata to.
 * @param metadataKey Metadata key.
 * @param metadataValue Metadata value.
 * @param options Options: {@link IOptions.overrideBy}.
 */
export function addMetadata<V>(target: object, metadataKey: unknown, metadataValue: V, options?: IOptions<V>) {
    // Check if metadata is already defined for this prototype, then we can just add to existing array
    // This saves us copying an array with every new @spine decorator
    let metadata = Reflect.getOwnMetadata(metadataKey, target) as V[] | undefined;
    if (!metadata) {
        // Otherwise, we need to check the parent's metadata:

        // Get the current metadata on the prototype chain
        const currentMetadata = (Reflect.getMetadata(metadataKey, target) ?? []) as V[];

        metadata = [...currentMetadata];
    }

    // Check if we need to override the metadata
    let overrideKeys = options?.overrideBy;
    if (overrideKeys) {
        if (!Array.isArray(overrideKeys)) overrideKeys = [overrideKeys];

        // Remove all values with the same key
        metadata = metadata.filter(
            (m) => !(overrideKeys as (keyof V)[]).every((key: keyof V) => m[key] === metadataValue[key]),
        );
    }

    // Add the metadata from this property
    metadata.push(metadataValue);

    // Set the new metadata
    Reflect.defineMetadata(metadataKey, metadata, target);
}
