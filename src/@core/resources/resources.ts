import type { Spine } from "@core/spine";
import { di } from "@elumixor/di";
import { DefaultMap, EventEmitter } from "@elumixor/frontils";
import type { ISkeletonData } from "pixi-spine";
import { Texture } from "pixi.js";
import { BehaviorSubject } from "rxjs";
import { type IGenerationOptions, generateSpineTexture } from "./generate-spine-texture";
import { Loader } from "./loader";
import { SpineMetadata } from "./spine-decorator";
import { SpinePool } from "./spine-pool";

export type IBaseFont = "myriad"; // more to be added later maybe

export interface IIconSymbolData {
    texture: Texture;
    textureBlurred: Texture;
    textureBlurredTurbo: Texture;
    spine: Spine;
}

@di.injectable
export class BaseResources {
    /** When the spines are loaded, pools are created for each spine. We can access them using this property */
    readonly spinePools = new DefaultMap(() => new BehaviorSubject<SpinePool | undefined>(undefined));
    /** Name of the sounds' folder */
    readonly soundsFolder = "sounds";
    /** Name of the spine files' folder */
    readonly spinesFolder = "spines";
    /** Name of the spritesheets' folder */
    readonly spritesFolder = "sprites";
    /** Name of the fonts' folder */
    readonly fontsFolder = "fonts";

    readonly mainLoaded = new EventEmitter();
    readonly lazyLoaded = new EventEmitter();

    // Main resources should be loaded before displaying the splash screen
    protected readonly mainLoader = new Loader("main");

    // Additional resources can be loaded in the background, they are not required immediately for the game to start
    protected readonly lazyLoader = new Loader("lazy");

    /** Parses the metadata added using the {@link spine} decorator */
    protected readonly spineMetadata = new SpineMetadata(this);
    protected readonly generators = [] as (() => void)[];

    constructor(
        readonly rootAssetsFolder: string,
        readonly htmlFolder: string,
    ) {
        // Remove the trailing slash if it exists
        if (rootAssetsFolder.endsWith("/")) this.rootAssetsFolder = rootAssetsFolder.slice(0, -1);
    }

    protected get spineNames() {
        return [...this.spineMetadata.byFileName.keys()].filter(
            (spineFileName) => !this.spineMetadata.isLazy.get(spineFileName),
        );
    }

    protected get lazySpineNames() {
        return [...this.spineMetadata.byFileName.keys()].filter((spineFileName) =>
            this.spineMetadata.isLazy.get(spineFileName),
        );
    }

    get<T = unknown>(name: string) {
        return this.mainLoader.get<T>(name) ?? this.lazyLoader.get<T>(name);
    }

    /** Utility to return the full path to a specific resources directory */
    pathTo(to: "sounds" | "spines" | "sprites" | "fonts" | "html") {
        if (to === "html") return this.htmlFolder;
        const toFolder = `${to}Folder` as const;
        return `${this.rootAssetsFolder}/${this[toFolder]}`;
    }

    async loadMain() {
        this.addSpines();
        await this.mainLoader.load();
        for (const spine of this.spineNames) this.loadSpine(spine);

        this.mainLoaded.emit();
    }

    async loadLazy() {
        this.addSpines("lazy");
        await this.lazyLoader.load();
        for (const spine of this.lazySpineNames) this.loadSpine(spine);

        this.lazyLoaded.emit();
    }

    protected addSpines(kind?: "lazy") {
        const isLazy = kind === "lazy";
        const loader = isLazy ? this.lazyLoader : this.mainLoader;

        for (const spineFileName of this.spineMetadata.byFileName.keys()) {
            if (isLazy !== this.spineMetadata.isLazy.get(spineFileName)) continue;

            loader.add(
                spineFileName,
                `${this.pathTo("spines")}/${spineFileName}.${this.spineMetadata.extension.get(spineFileName)}`,
            );
        }
    }

    /**
     * When the skeleton data is loaded we:
     * 1. Create pools for the spines
     * 2. Generate textures and blurred textures from the first frame of the animation (only for {@link symbolData} symbols)
     * @param spineFileName The name of the spine file
     * @param skeletonData The skeleton data which was just loaded
     */
    protected loadSpine(spineFileName: string) {
        const data = this.mainLoader.get(spineFileName) ?? this.lazyLoader.get(spineFileName);
        if (!data) throw new Error(`Skeleton data for ${spineFileName} not found`);

        for (const spineMetadata of this.spineMetadata.byFileName.get(spineFileName)) {
            // Get the corresponding property key
            const propertyKey = spineMetadata.propertyKey;

            // Create a spine pool - pool parameters are defined with the @spine decorator
            const pool = new SpinePool((data as { spineData: ISkeletonData }).spineData, spineMetadata);

            // Generate textures if:
            const generationOptions = new Array<IGenerationOptions>();

            // If the metadata contains the generation options, we add them as well
            generationOptions.push(...(spineMetadata.generationOptions ?? []));

            if (generationOptions.nonEmpty) {
                const generator = () => {
                    // Get the spine
                    const spineInstance = pool.obtain();

                    // Generate some textures
                    for (const options of generationOptions)
                        generateSpineTexture(spineInstance, options, { name: propertyKey });

                    // Release back to pool
                    spineInstance.release();
                };

                generator();
                this.generators.push(generator);
            }

            this.spinePools.get(propertyKey).next(pool);
        }
    }
}
