import { Container, type IPointData, type Loader, type Point } from "pixi.js";

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
        fitTo(width: number, height?: number, options?: IFitOptions): number;
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
        distanceTo(other: IPointData): number;
        angleTo(other: IPointData): number;
    }
}

interface IFitOptions {
    // If true, will adjust X to account for resizing
    keepX?: true;
    // If true, will adjust Y to account for resizing
    keepY?: true;
}

Reflect.defineProperty(Container.prototype, "uniformHeight", {
    set(this: Container, value: number) {
        const ar = this.scale.y / this.scale.x;
        this.scale.set(1);
        this.scale.set(value / this.width, (value / this.width) * ar);
    },
    configurable: true,
});

Reflect.defineProperty(Container.prototype, "uniformWidth", {
    set(this: Container, value: number) {
        const ar = this.scale.x / this.scale.y;
        this.scale.set(1);
        this.scale.set((value / this.height) * ar, value / this.height);
    },
    configurable: true,
});

Reflect.defineProperty(Container.prototype, "fitTo", {
    value<T extends Container>(this: T, width: number, height: number, { keepX = false, keepY = false } = {}) {
        const { width: oldWidth, height: oldHeight } = this;

        if (width / this.width < height / this.height) this.uniformWidth = width;
        else this.uniformHeight = height;

        const { width: newWidth, height: newHeight } = this;

        if (Reflect.has(this, "anchor")) {
            const {
                anchor: { x, y },
            } = this as unknown as { anchor: Point };
            if (keepY) this.y += (newHeight - oldHeight) * y;
            if (keepX) this.x += (newWidth - oldWidth) * x;
        }
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

Reflect.defineProperty(Container.prototype, "distanceTo", {
    value(this: Container, other: Container) {
        return Math.hypot(this.x - other.x, this.y - other.y);
    },
    configurable: true,
});

Reflect.defineProperty(Container.prototype, "angleTo", {
    value(this: Container, other: Container) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    },
    configurable: true,
});
