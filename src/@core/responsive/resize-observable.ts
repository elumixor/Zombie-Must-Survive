import { type AnyConstructor, wraps } from "@elumixor/frontils";
import { Resizer } from "./resizer";
import { metadataKey, type OrientationMap, observableProxies } from "./types";
import { updateResponsiveElements } from "./update-responsive-elements";
import type { IRotateObservable, IResizeObservable, IDimensions } from "./resizer";
import { di } from "@elumixor/di";

/**
 * Automatically subscribes to the {@link Resizer} upon the object's instantiation.
 */
export function resizeObservable<TBase extends AnyConstructor<Partial<IResizeObservable | IRotateObservable>>>(
    Base: TBase,
): TBase {
    const prototype = Base.prototype as InstanceType<TBase>;

    // Check if the object has any @responsive elements
    // If so, resize() method should be added automatically
    const responsiveMetadata = Reflect.getOwnMetadata(metadataKey, prototype) as OrientationMap | undefined;

    const isResizeObservable = "resize" in prototype;
    const isRotateObservable = "changeOrientation" in prototype;
    const isBeforeRotateObservable = "beforeChangeOrientation" in prototype;

    if (!responsiveMetadata && !isResizeObservable && !isRotateObservable && !isBeforeRotateObservable) {
        debug(
            `Class ${Base.name} should define either resize(), changeOrientation(), beforeChangeOrientation(), ` +
                `or have at least one field decorated with "@responsive"`,
        );

        return Base;
    }

    @wraps(Base)
    class Wrapper extends Base {
        protected declare readonly [observableProxies]?: object[];

        /* istanbul ignore next */
        constructor(...params: unknown[]) {
            // Base may either be a constructor or an abstract constructor
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            super(...params);

            const resizeObserver = di.inject(Resizer);

            // Subscribe to resize observer
            // We create a proxy object to keep the correct method of the prototype.
            // As we'll be calling the "resize()" method in the constructor, the following situation is possible:
            // 1. We define some base class Base with @responsive elements. We place @responsive to make it resize observable
            // 2. We extend Base with another class Child. This class child overrides "resize()" method to position it's own elements
            // 3. We instantiate the child, thus calling the "Base.resize()" method in the constructor. But its overridden
            //    and so we actually call Child.resize(). But the Child was not yet initialized, so in that resize() call
            //    we try to access some fields that are not yet initialized. We solve it like this:
            const proxy = {};
            if ("resize" in prototype)
                Reflect.defineProperty(proxy, "resize", {
                    value: (dimensions: IDimensions) =>
                        prototype.resize?.call(this as unknown as IResizeObservable, dimensions),
                });

            if ("changeOrientation" in prototype)
                Reflect.defineProperty(proxy, "changeOrientation", {
                    value: (dimensions: IDimensions) =>
                        prototype.changeOrientation?.call(this as unknown as IRotateObservable, dimensions),
                });

            resizeObserver.observe(proxy as unknown as IResizeObservable | IRotateObservable);

            if (!this[observableProxies]) this[observableProxies] = [];
            this[observableProxies].push(proxy);

            // At this points if some @responsive elements were added, they were positioned, but only if the config is non-static
            // So we need to position the static configs now manually
            updateResponsiveElements(this, resizeObserver.dimensions, true);
        }
    }

    // Add the resize and changeOrientation methods if they are not present
    const originalResize = Reflect.get(prototype, "resize") as IResizeObservable["resize"] | undefined;

    Reflect.defineProperty(prototype, "resize", {
        value(this: TBase, dimensions: IDimensions) {
            updateResponsiveElements(this, dimensions);

            // Remember to call super's function
            originalResize?.call(this, dimensions);
        },
        configurable: true,
    });

    const originalChangeOrientation = Reflect.get(prototype, "changeOrientation") as
        | IRotateObservable["changeOrientation"]
        | undefined;

    Reflect.defineProperty(prototype, "changeOrientation", {
        value(this: TBase, dimensions: IDimensions) {
            updateResponsiveElements(this, dimensions, true);

            // Remember to call super's function
            originalChangeOrientation?.call(this, dimensions);
        },
    });

    return Wrapper;
}
