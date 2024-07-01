import type { IPoolParameters } from "@core/pooling";
import type { IGenerationOptions } from "../generate-spine-texture";

/**
 * Parameters for the @spine decorator
 */
export interface SpineParameters extends IPoolParameters, Omit<IGenerationOptions, "texture"> {
    /**
     * Should the spine be lazy loaded?
     *
     * If true, then the app will start without this spine loaded.
     *
     * Defaults to false.
     */
    lazy?: true;
    /**
     * We might want to generate some textures from this spine
     */
    generationOptions?: readonly IGenerationOptions[];
    /**
     * Extension of spine skeleton data file, default is "json"
     */
    extension?: SpineExtension;
}

export type SpineExtension = "json" | "skel";
