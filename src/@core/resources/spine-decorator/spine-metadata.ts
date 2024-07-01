import { DefaultMap } from "@elumixor/frontils";
import type { BaseResources } from "../resources";
import type { SpineParameters, SpineExtension } from "./ispine-parameters";

interface ISpineMetadata extends SpineParameters {
    fileName: string;
    propertyKey: string;
}

// We use this symbol as a `metadataKey` in `Reflect`
export const spineMetadataSymbol = Symbol("spineMetadata");

/**
 * Utility class to access spine metadata
 */
export class SpineMetadata {
    /**
     * Access metadata by property key. This is a 1:1 mapping.
     */
    readonly byPropertyKey = new Map<string, ISpineMetadata>();
    /**
     * Access metadata by spine key.
     *
     * Note that this is a 1:N mapping as different symbols may use different skins or win animations.
     */
    readonly byFileName = new DefaultMap<string, ISpineMetadata[]>(() => new Array<ISpineMetadata>());
    /**
     * Should this resource be lazily loaded?
     */
    readonly isLazy = new Map<string, boolean>();
    /**
     * Extension of the spine skeleton data
     */
    readonly extension = new Map<string, SpineExtension>();

    /**
     * Utility class to access spine metadata
     * @param target {@link BaseResources} instance
     */
    constructor(target: BaseResources) {
        const spinesMetadata = (Reflect.getMetadata(spineMetadataSymbol, target) ?? []) as ISpineMetadata[];

        for (const spineMetadata of spinesMetadata) {
            this.byFileName.get(spineMetadata.fileName).push(spineMetadata);
            this.byPropertyKey.set(spineMetadata.propertyKey, spineMetadata);

            this.extension.set(spineMetadata.fileName, spineMetadata.extension ?? "json");
            this.isLazy.set(spineMetadata.fileName, spineMetadata.lazy ?? false);
        }
    }
}
