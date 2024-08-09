import { ObservablePoint, Point, type IPointData } from "pixi.js";

declare module "pixi.js" {
    interface Extensions {
        [0]: number;
        [1]: number;
        length: number;
        lengthSquared: number;
        /** Returns a vector with the unit length and the same direction */
        readonly normalized: Vec2Out;
        /** Returns an angle in radians */
        readonly angle: number;
        readonly sign: Vec2Out;
        [Symbol.iterator](): Generator<number>;
        add(scalar: number): Vec2Out;
        add(x: number, y: number): Vec2Out;
        add(other: Vec2In): Vec2Out;
        sub(scalar: number): Vec2Out;
        sub(x: number, y: number): Vec2Out;
        sub(other: Vec2In): Vec2Out;
        div(scalar: number): Vec2Out;
        div(x: number, y: number): Vec2Out;
        div(other: Vec2In): Vec2Out;
        mul(scalar: number): Vec2Out;
        mul(x: number, y: number): Vec2Out;
        mul(other: Vec2In): Vec2Out;
        /* Inline version of the above methods */
        iadd(scalar: number): void;
        iadd(x: number, y: number): void;
        iadd(other: Vec2In): void;
        isub(scalar: number): void;
        isub(x: number, y: number): void;
        isub(other: Vec2In): void;
        idiv(scalar: number): void;
        idiv(x: number, y: number): void;
        idiv(other: Vec2In): void;
        imul(scalar: number): void;
        imul(x: number, y: number): void;
        imul(other: Vec2In): void;
        withLength(length: number): Vec2Out;
        distanceTo(other: Vec2In): number;
        distanceToSquared(other: Vec2In): number;
        zero(): void;
        /** Returns an angle in radians */
        angleTo(other: Vec2In): number;
        clip(max: number): void;
        clip(min: number, max: number): void;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Point extends Extensions {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ObservablePoint extends Extensions {}

    type Vec2Out = Point;
    type Vec2In = IPointData;
}

type Vec2In = ObservablePoint | Point;
export class Vec2 extends Point {
    static get zero() {
        return new Vec2();
    }
    static get one() {
        return new Vec2(1, 1);
    }
    static get up() {
        return new Vec2(0, -1);
    }
    static get down() {
        return new Vec2(0, 1);
    }
    static get left() {
        return new Vec2(-1, 0);
    }
    static get right() {
        return new Vec2(1, 0);
    }
    static random() {
        return new Vec2(random() - 0.5, random() - 0.5).normalized;
    }
}

export type ReadonlyVec2 = Omit<Vec2, "x" | "y" | "iadd">;

for (const target of [ObservablePoint, Point]) {
    Reflect.defineProperty(target.prototype, "0", {
        get(this: Vec2) {
            return this.x;
        },
        set(this: Vec2, value: number) {
            this.x = value;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "1", {
        get(this: Vec2) {
            return this.y;
        },
        set(this: Vec2, value: number) {
            this.y = value;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "length", {
        get(this: Vec2) {
            return hypot(this.x, this.y);
        },
        set(this: Vec2, value: number) {
            const { length } = this;
            if (length === 0) return;
            this.imul(value / length);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "lengthSquared", {
        get(this: Vec2) {
            return this.x * this.x + this.y * this.y;
        },
        set(this: Vec2, value: number) {
            const factor = sqrt(value / this.lengthSquared);
            this.x *= factor;
            this.y *= factor;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "normalized", {
        get(this: Vec2) {
            if (this.length === 0) return this;
            return this.div(this.length);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "angle", {
        get(this: Vec2) {
            return atan2(this.y, this.x);
        },
        set(this: Vec2, value: number) {
            const length = this.length;
            this.x = cos(value) * length;
            this.y = sin(value) * length;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "sign", {
        get(this: Vec2) {
            return new Vec2(sign(this.x), sign(this.y));
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, Symbol.iterator, {
        *value(this: Vec2) {
            yield this.x;
            yield this.y;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "add", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") return new Vec2(this.x + arg, this.y + arg);
                return new Vec2(this.x + arg.x, this.y + arg.y);
            }

            const [x, y] = args as [number, number];
            return new Vec2(this.x + x, this.y + y);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "sub", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") return new Vec2(this.x - arg, this.y - arg);
                return new Vec2(this.x - arg.x, this.y - arg.y);
            }

            const [x, y] = args as [number, number];
            return new Vec2(this.x - x, this.y - y);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "div", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") return new Vec2(this.x / arg, this.y / arg);
                return new Vec2(this.x / arg.x, this.y / arg.y);
            }

            const [x, y] = args as [number, number];
            return new Vec2(this.x / x, this.y / y);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "mul", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") return new Vec2(this.x * arg, this.y * arg);
                return new Vec2(this.x * arg.x, this.y * arg.y);
            }

            const [x, y] = args as [number, number];
            return new Vec2(this.x * x, this.y * y);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "iadd", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") {
                    this.x += arg;
                    this.y += arg;
                } else {
                    this.x += arg.x;
                    this.y += arg.y;
                }
            } else {
                const [x, y] = args as [number, number];
                this.x += x;
                this.y += y;
            }
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "isub", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") {
                    this.x -= arg;
                    this.y -= arg;
                } else {
                    this.x -= arg.x;
                    this.y -= arg.y;
                }
            } else {
                const [x, y] = args as [number, number];
                this.x -= x;
                this.y -= y;
            }
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "idiv", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") {
                    this.x /= arg;
                    this.y /= arg;
                } else {
                    this.x /= arg.x;
                    this.y /= arg.y;
                }
            } else {
                const [x, y] = args as [number, number];
                this.x /= x;
                this.y /= y;
            }
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "imul", {
        value(this: Vec2In, ...args: (number | Vec2In)[]) {
            if (args.length === 1) {
                const arg = args[0];
                if (typeof arg === "number") {
                    this.x *= arg;
                    this.y *= arg;
                } else {
                    this.x *= arg.x;
                    this.y *= arg.y;
                }
            } else {
                const [x, y] = args as [number, number];
                this.x *= x;
                this.y *= y;
            }
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "withLength", {
        value(this: Vec2In, length: number) {
            return this.normalized.mul(length);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "distanceTo", {
        value(this: Vec2In, other: Vec2In) {
            return this.sub(other).length;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "distanceToSquared", {
        value(this: Vec2In, other: Vec2In) {
            return this.sub(other).lengthSquared;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "zero", {
        value(this: Vec2In) {
            this.x = 0;
            this.y = 0;
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "angleTo", {
        value(this: Vec2In, other: Vec2In) {
            return atan2(other.y - this.y, other.x - this.x);
        },
        configurable: true,
    });

    Reflect.defineProperty(target.prototype, "clip", {
        value(this: Vec2In, ...args: number[]) {
            if (args.length === 1) {
                const [max] = args;
                this.length = min(this.length, max);
            } else {
                const [min, max] = args;
                this.length = clamp(this.length, min, max);
            }
        },
        configurable: true,
    });
}

function vec2fn(x = 0, y = x) {
    return new Vec2(x, y);
}

Reflect.defineProperty(vec2fn, "zero", {
    get() {
        return vec2fn();
    },
});

Reflect.defineProperty(vec2fn, "one", {
    get() {
        return vec2fn(1);
    },
});

Reflect.defineProperty(vec2fn, "random", {
    get() {
        return vec2fn(random(), random());
    },
});
Reflect.defineProperty(vec2fn, "up", {
    get() {
        return vec2fn(0, -1);
    },
});
Reflect.defineProperty(vec2fn, "down", {
    get() {
        return vec2fn(0, 1);
    },
});
Reflect.defineProperty(vec2fn, "left", {
    get() {
        return vec2fn(-1, 0);
    },
});
Reflect.defineProperty(vec2fn, "right", {
    get() {
        return vec2fn(1, 0);
    },
});

type V = typeof vec2fn & {
    zero: Vec2;
    one: Vec2;
    up: Vec2;
    down: Vec2;
    left: Vec2;
    right: Vec2;
    random: Vec2;
};

export const vec2 = vec2fn as V;
