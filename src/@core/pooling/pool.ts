import type { IPool, IPoolParameters, IPooledInstance } from "./types";

export class Pool<T extends object & IPooledInstance> implements IPool<T> {
    readonly max;

    private readonly instances: T[];
    private _inUse = 0;

    constructor(
        private readonly constructorFunction: (pool: Pool<T>) => T,
        parameters?: IPoolParameters,
    ) {
        this.max = parameters?.max ?? Infinity;
        const amount = parameters?.amount ?? 0;

        this.instances = Array.from({ length: amount }, () => constructorFunction(this));
    }

    get inUse() {
        return this._inUse;
    }

    obtain(): T {
        // Check if the pool size has reached its maximum
        if (this._inUse === this.max) throw new Error("Maximum pooled instances count has been exceeded");

        // Increase the numbed of the spines currently "obtained" and in use
        this._inUse++;

        // If we have a returned ("released") instance, we can re-use it
        if (this.instances.length > 0) {
            const instance = this.instances.shift()!;
            instance.onObtain?.();
            return instance;
        }

        // Otherwise, we can create a new instance
        const instance = this.constructorFunction(this);
        instance.onObtain?.();
        return instance;
    }

    release(spine: T) {
        if (this._inUse === 0 || this.instances.includes(spine))
            throw new Error("The instance being released is already released");

        this._inUse--;
        this.instances.push(spine);
    }
}
