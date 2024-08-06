import { injectable } from "@core/di";
import type { IPoint } from "@core/utils";
import { EventEmitter, getElementOrThrow, type ISubscription } from "@elumixor/frontils";
import type { IRenderer } from "pixi.js";

export interface RequiredScales {
    landscape: IPoint;
    portrait: IPoint;
}

@injectable
export class Resizer {
    readonly requiredScales;
    protected readonly resized = new EventEmitter<IDimensions>();
    protected readonly rotated = new EventEmitter<IDimensions>();
    protected readonly canvasContainer = getElementOrThrow("canvas-container");
    /** In case we want to unsubscribe */
    protected readonly boundMap = new WeakMap<
        IResizeObservable | IRotateObservable,
        { resize?: ISubscription<unknown>; rotate?: ISubscription<unknown> }
    >();
    protected resizeTimeoutID = 0;
    protected _dimensions;

    constructor(
        protected readonly renderer: IRenderer,
        options: RequiredScales,
    ) {
        window.addEventListener("resize", () => this.update(), false);

        const landscape = options.landscape;
        const portrait = options.portrait;

        this.requiredScales = { landscape, portrait } as const;

        this._dimensions = this.calculateDimensions();
    }

    get dimensions() {
        return this._dimensions;
    }

    get orientation() {
        return this._dimensions.orientation;
    }

    get scale() {
        return this._dimensions.scale;
    }

    get width() {
        return this._dimensions.width;
    }

    get clientWidth() {
        return this._dimensions.clientWidth;
    }

    get height() {
        return this._dimensions.height;
    }

    get clientHeight() {
        return this._dimensions.clientHeight;
    }

    get isPortrait() {
        return this._dimensions.isPortrait;
    }

    observe(observable: IResizeObservable | IRotateObservable) {
        const isResizeObservable = "resize" in observable;
        const isRotateObservable = "changeOrientation" in observable;

        const bound = {
            resize: undefined as ISubscription<unknown> | undefined,
            rotate: undefined as ISubscription<unknown> | undefined,
        };

        if (isResizeObservable)
            bound.resize = this.resized.subscribe(observable.resize.bind(observable)) as ISubscription<unknown>;
        if (isRotateObservable)
            bound.rotate = this.rotated.subscribe(
                observable.changeOrientation.bind(observable),
            ) as ISubscription<unknown>;

        this.boundMap.set(observable, bound);

        if (isResizeObservable) observable.resize(this.dimensions);
        if (isRotateObservable) observable.changeOrientation(this.dimensions);
    }

    unsubscribe(observable: object) {
        const found = this.boundMap.get(observable as IResizeObservable | IRotateObservable);
        if (!found) return;
        this.boundMap.delete(observable as IResizeObservable | IRotateObservable);

        found.resize?.unsubscribe();
        found.rotate?.unsubscribe();
    }

    update() {
        const previousOrientation = this.orientation;
        this._dimensions = this.calculateDimensions();
        const orientationChanged = previousOrientation !== this.orientation;

        if (orientationChanged) this.rotated.emit(this._dimensions);
        this.resized.emit(this._dimensions);

        this.renderer.resize(this.clientWidth, this.clientHeight);
    }

    protected calculateDimensions() {
        const { clientWidth, clientHeight } = document.documentElement;

        const orientation = clientWidth > clientHeight ? "landscape" : "portrait";

        const [requiredWidth, requiredHeight] = this.requiredScales[orientation];

        const scale = Math.min(clientHeight / requiredHeight, clientWidth / requiredWidth);
        const width = clientWidth / scale;
        const height = clientHeight / scale;

        return {
            clientWidth,
            clientHeight,
            scale,
            height,
            width,
            orientation,
            isPortrait: orientation === "portrait",
        } as const;
    }
}

export type IDimensions = Resizer["dimensions"];

export interface IResizeObservable {
    ["resize"]: (dimensions: IDimensions) => void;
}

export interface IRotateObservable {
    changeOrientation(dimensions: IDimensions): void;
}
