import { type AnyConstructor, wraps } from "@elumixor/frontils";

const target = globalThis as typeof globalThis & { __di_injectable_map__?: Map<unknown, object> };
if (!Reflect.has(target, "__di_injectable_map__"))
    Reflect.set(target, "__di_injectable_map__", new Map<unknown, object>());

const serviceMap = target.__di_injectable_map__!;

/**
 * Obtains the instance of the required service.
 *
 * Like {@link tryGet}, but throws an error if the service is not found.
 *
 * @returns The instance of the service.
 * @throws {@link Error} If the service is not provided.
 * @param service The class of the service to obtain.
 */
export function inject<T extends object>(service: AnyConstructor<T>, options?: { optional?: false }): T;
export function inject<T extends object>(service: AnyConstructor<T>, options: { optional: true }): T | undefined;
export function inject<T extends object>(service: AnyConstructor<T>, options?: { optional?: boolean }) {
    const instance = serviceMap.get(service);
    if (instance) return instance as T;
    if (options?.optional) return undefined;
    throw new Error(`No provider for ${service.name}`);
}

/**
 * Provides and instance of a service.
 * @param service The class of the service.
 * @param instance The instance of the service to be provided.
 */
export function provide<T extends object>(service: AnyConstructor<T>, instance: T) {
    if (serviceMap.has(service)) throw new Error(`Provider ${service.name} is already specified`);

    serviceMap.set(service, instance);
}

/**
 * Checks if a service is provided.
 * @param service The class of the service.
 */
function isProvided(service: AnyConstructor) {
    return serviceMap.has(service);
}

export function injectable<TBase extends AnyConstructor>(Base: TBase): TBase {
    if (isProvided(Reflect.getPrototypeOf(Base) as AnyConstructor))
        throw new Error("Trying to provide a different child for the same provided parent");

    @wraps(Base)
    class Wrapper extends Base {
        constructor(...args: ConstructorParameters<TBase>) {
            if (isProvided(Wrapper))
                throw new Error("Trying to provide a different child for the same provided parent");

            // Base may either be a constructor or an abstract constructor
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            super(...args);
            provide(Wrapper, this);
        }
    }

    return Wrapper;
}
