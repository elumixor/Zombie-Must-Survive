import { di } from "@elumixor/di";
import { type AnyConstructor, DefaultMap } from "@elumixor/frontils";
import "reflect-metadata";
import { resizeObservable } from "./resize-observable";
import { Resizer } from "./resizer";
import { type IElementConfig, metadataKey, type Orientation, type OrientationMap } from "./types";
import { isStatic, updateResponsiveElement } from "./update-responsive-elements";

export interface IResponsiveDecorator {
    /** When used over the class, acts as a decorator that automatically subscribes this object to the ResizeObserver */
    (target: AnyConstructor): void;

    /** Decorator that adds responsive configuration in all orientations */
    (configuration: IElementConfig): PropertyDecorator;

    /** Dynamically adds responsive configuration for all orientations */
    (target: object, key: string, configuration: IElementConfig): PropertyDecorator;

    /** Decorator that adds responsive configuration in portrait and desktopNarrow orientations */
    portrait(configuration: IElementConfig): PropertyDecorator;

    /** Dynamically adds responsive configuration for portrait and desktopNarrow orientations */
    portrait(target: object, key: string, configuration: IElementConfig): PropertyDecorator;

    /** Decorator that adds responsive configuration in landscape and desktop orientations */
    landscape(configuration: IElementConfig): PropertyDecorator;

    /** Dynamically adds responsive configuration for landscape and desktop orientations */
    landscape(target: object, key: string, configuration: IElementConfig): PropertyDecorator;

    /** Decorator that adds responsive configuration in desktop orientation */
    desktop(configuration: IElementConfig): PropertyDecorator;

    /** Dynamically adds responsive configuration for desktop orientation */
    desktop(target: object, key: string, configuration: IElementConfig): PropertyDecorator;

    /** Decorator that adds responsive configuration in desktopNarrow orientation */
    desktopNarrow(configuration: IElementConfig): PropertyDecorator;

    /** Dynamically adds responsive configuration for desktopNarrow orientation */
    desktopNarrow(target: object, key: string, configuration: IElementConfig): PropertyDecorator;
}

// The responsive object is formed by assigning some properties to the base function
export const responsive = Object.assign(
    // The function itself
    (...args: unknown[]) => {
        // First we should check for the number of arguments
        if (args.length === 1) {
            const first = args.first;

            // We can't really check for a constructor here, but we can check for a function
            if (typeof first === "function") return resizeObservable(first as AnyConstructor);

            // Otherwise it is a configuration object
            return propertyDecorator(first as IElementConfig, ["portrait", "landscape", "desktop", "desktopNarrow"]);
        }

        // If there are more than one arguments, it is function to be called dynamically
        const target = args.first as object;
        const key = args[1] as keyof object;
        const config = args[2] as IElementConfig;

        propertyDecorator(config, ["portrait", "landscape", "desktop", "desktopNarrow"])(target, key);
        updateResponsiveElement(target[key], config, di.inject(Resizer).dimensions, isStatic(config));
        return;
    },
    {
        // Similarly for the properties
        portrait: (...args: unknown[]) => {
            if (args.length === 1)
                return propertyDecorator(args.first as IElementConfig, ["portrait", "desktopNarrow"]);

            const target = args.first as object;
            const key = args[1] as keyof object;
            const config = args[2] as IElementConfig;

            propertyDecorator(config, ["portrait", "desktopNarrow"])(target, key);
            updateResponsiveElement(target[key], config, di.inject(Resizer).dimensions, isStatic(config));
            return;
        },
        landscape: (...args: unknown[]) => {
            if (args.length === 1) return propertyDecorator(args.first as IElementConfig, ["landscape", "desktop"]);

            const target = args.first as object;
            const key = args[1] as keyof object;
            const config = args[2] as IElementConfig;

            propertyDecorator(config, ["landscape", "desktop"])(target, key);
            updateResponsiveElement(target[key], config, di.inject(Resizer).dimensions, isStatic(config));
            return;
        },
        desktop: (...args: unknown[]) => {
            if (args.length === 1) return propertyDecorator(args.first as IElementConfig, ["desktop"]);

            const target = args.first as object;
            const key = args[1] as keyof object;
            const config = args[2] as IElementConfig;

            propertyDecorator(config, ["desktop"])(target, key);
            updateResponsiveElement(target[key], config, di.inject(Resizer).dimensions, isStatic(config));
            return;
        },
        desktopNarrow: (...args: unknown[]) => {
            if (args.length === 1) return propertyDecorator(args.first as IElementConfig, ["desktopNarrow"]);

            const target = args.first as object;
            const key = args[1] as keyof object;
            const config = args[2] as IElementConfig;

            propertyDecorator(config, ["desktopNarrow"])(target, key);
            updateResponsiveElement(target[key], config, di.inject(Resizer).dimensions, isStatic(config));
            return;
        },
    },
) as IResponsiveDecorator;

// Returns a decorator that adds the specified config + orientation metadata to the property
function propertyDecorator(config: IElementConfig, orientations: Orientation[]) {
    return (target: object, key: string) => {
        // Get the already stored metadata or create a new one if it doesn't exist
        const previousMetadata = Reflect.getMetadata(metadataKey, target) as OrientationMap | undefined;
        const metadata = previousMetadata ?? new DefaultMap(() => new Map<string, IElementConfig>());

        // Add the config of this property key for each orientation
        for (const orientation of orientations) metadata.get(orientation).set(key, config);

        // Store the new/updated metadata
        Reflect.defineMetadata(metadataKey, metadata, target);
    };
}
