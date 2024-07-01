export interface IPoolParameters {
    amount?: number;
    max?: number;
}

export interface IPooledInstance {
    onObtain?: () => void;
}

export interface IPool<T> {
    obtain(): T;
    release(spine: T): void;
}
