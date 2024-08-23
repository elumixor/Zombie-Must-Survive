import { Vec2 } from "@core/extensions";

export {};

declare global {
    /**
     * Interpolates from the `from` to the `to` number given `p`.
     * If `p == 0` returns `from`, otherwise returns `to`
     */
    function lerp(from: number, to: number, p: number): number;
    /**
     * Interpolates from the `from` {@link Vec2} to the `to` {@link Vec2} given `p`.
     * If `p == 0` returns `from`, otherwise returns `to`
     */
    function lerp(from: Vec2, to: Vec2, p: number): Vec2;
    function clamp(value: number, min: number, max: number): number;
    function clamp01(value: number): number;
    function max(...values: number[]): number;
    function min(...values: number[]): number;
    function range(min: number, max: number): number[];
    function range(max: number): number[];
    function norm(x: number, y: number): number;
    function sign(value: number, zeroValue?: number): number;
    function hypot(x: number, y: number): number;
    function sqrt(value: number): number;
    function cos(value: number): number;
    function sin(value: number): number;
    function atan2(y: number, x: number): number;
    /** Random float from in [0, 1) range */
    function random(): number;
    /** Random float in range [0, max) range */
    function random(max: number): number;
    /** Random float in range [min, max) range */
    function random(min: number, max: number): number;
    function floor(value: number): number;
    function ceil(value: number): number;
    function round(value: number, precision?: number): number;
    function abs(value: number): number;
    function pow(value: number, power: number): number;
    function deg2rad(degrees: number): number;
    function rad2deg(radians: number): number;
}

Reflect.defineProperty(globalThis, "lerp", {
    value(from: number | Vec2, to: number | Vec2, p: number) {
        if (typeof from === "number") {
            assert(typeof to === "number", 'Both interpolated "from" and "to" should be numbers');
            return from + (to - from) * p;
        }

        assert(to instanceof Vec2, 'Both interpolated "from" and "to" should be Vec2');
        return from.add(to.sub(from).mul(p));
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

Reflect.defineProperty(globalThis, "norm", {
    value(x: number, y: number) {
        return Math.hypot(x, y);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "sign", {
    value(value: number, zeroValue = 0) {
        return value === 0 ? zeroValue : Math.sign(value);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "hypot", {
    value(x: number, y: number) {
        return Math.hypot(x, y);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "sqrt", {
    value(value: number) {
        return Math.sqrt(value);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "cos", {
    value(value: number) {
        return Math.cos(value);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "sin", {
    value(value: number) {
        return Math.sin(value);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "atan2", {
    value(y: number, x: number) {
        return Math.atan2(y, x);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "random", {
    value(...args: number[]) {
        if (args.length === 0) return Math.random();
        if (args.length === 1) return Math.random() * args[0];
        return Math.random() * (args[1] - args[0]) + args[0];
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "floor", {
    value(value: number) {
        return Math.floor(value);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "ceil", {
    value(value: number) {
        return Math.ceil(value);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "round", {
    value(value: number, precision = 0) {
        if (precision <= 0) return Math.round(value);

        const factor = 1 / precision;
        return Math.round(value * factor) / factor;
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "abs", {
    value(value: number) {
        return Math.abs(value);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "pow", {
    value(value: number, power: number) {
        return Math.pow(value, power);
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "deg2rad", {
    value(degrees: number) {
        return (degrees * Math.PI) / 180;
    },
    writable: false,
    enumerable: false,
    configurable: false,
});

Reflect.defineProperty(globalThis, "rad2deg", {
    value(radians: number) {
        return (radians * 180) / Math.PI;
    },
    writable: false,
    enumerable: false,
    configurable: false,
});
