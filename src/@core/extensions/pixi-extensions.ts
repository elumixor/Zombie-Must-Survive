import { Container, type Loader } from "pixi.js";

declare module "pixi.js" {
    interface ILoaderAdd {
        // eslint-disable-next-line @typescript-eslint/prefer-function-type
        (this: Loader, ...params: unknown[]): Loader;
    }

    interface Container {
        /**
         * Sets the height to a given value, while keeping the aspect ratio.
         * @param value The new height.
         */
        set uniformHeight(value: number);
        /**
         * Sets the width to a given value, while keeping the aspect ratio.
         * @param value The new width.
         */
        set uniformWidth(value: number);
        /**
         * Changes the width and height to fit into the rectangle, defined by parameters while keeping the aspect ratio.
         * @param width Maximum width.
         * @param height Maximum height.
         * @param options See {@link IFitOptions}.
         */
        fitTo(width: number, height: number, options?: { scaleUp?: boolean }): number;
        /**
         * Adds a child before another child in a container.
         * @param child The child to add.
         * @param before The child to add the child before.
         */
        addChildBefore<TChild extends Container>(child: TChild, before: Container): TChild;
        /**
         * Adds a child after another child in a container.
         * @param child The child to add.
         * @param after The child to add the child after.
         */
        addChildAfter<TChild extends Container>(child: TChild, after: Container): TChild;
    }
}

Reflect.defineProperty(Container.prototype, "uniformHeight", {
    set(this: Container, value: number) {
        const multiplier = value / this.height;
        this.scale.x *= multiplier;
        this.scale.y *= multiplier;
    },
    configurable: true,
});

Reflect.defineProperty(Container.prototype, "uniformWidth", {
    set(this: Container, value: number) {
        const multiplier = value / this.width;
        this.scale.x *= multiplier;
        this.scale.y *= multiplier;
    },
    configurable: true,
});

Reflect.defineProperty(Container.prototype, "fitTo", {
    value<T extends Container>(this: T, width: number, height: number, { scaleUp = true } = {}) {
        if (!scaleUp) {
            width = Math.min(width, this.width);
            height = Math.min(height, this.height);
        }

        this.uniformWidth = width;
        if (this.height > height) this.uniformHeight = height;
    },
    writable: false,
    configurable: true,
});

Reflect.defineProperty(Container.prototype, "addChildBefore", {
    value(this: Container, child: Container, before: Container) {
        return this.addChildAt(child, this.children.indexOf(before));
    },
    configurable: true,
});

Reflect.defineProperty(Container.prototype, "addChildAfter", {
    value(this: Container, child: Container, after: Container) {
        return this.addChildAt(child, this.children.indexOf(after) + 1);
    },
    configurable: true,
});
