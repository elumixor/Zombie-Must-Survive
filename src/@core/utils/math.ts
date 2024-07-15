export {};

declare global {
    function lerp(p: number, from: number, to: number): number;
    function clamp(value: number, min: number, max: number): number;
    function clamp01(value: number): number;
    function max(...values: number[]): number;
    function min(...values: number[]): number;
    function range(min: number, max: number): number[];
    function range(max: number): number[];
}

Reflect.defineProperty(globalThis, "lerp", {
    value(p: number, from: number, to: number) {
        return from + (to - from) * p;
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "clamp", {
    value(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "clamp01", {
    value(value: number) {
        return Math.min(Math.max(value, 0), 1);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "max", {
    value(...values: number[]) {
        return Math.max(...values);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "min", {
    value(...values: number[]) {
        return Math.min(...values);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "range", {
    value(min: number, max?: number) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Array.from({ length: max - min }, (_, i) => i + min);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});
