import { injectable } from "@core/di";
import { ResizeObserver, type RequiredScales } from "@core/responsive";
import { getElementOrThrow } from "@elumixor/frontils";
import { gsap } from "gsap";
import { Application, Ticker } from "pixi.js";

declare global {
    interface Window {
        resolution: number;
    }
}

@injectable
export class App {
    readonly canvasContainer = getElementOrThrow("canvas-container");
    readonly resolution = window.resolution !== 1 ? window.devicePixelRatio : 1;
    readonly pixiApp = new Application({
        resolution: this.resolution,
        resizeTo: this.canvasContainer,
        backgroundColor: 0,
        // forceCanvas: true, // we need to add legacy plugin for this if we want
    });
    readonly renderer = this.pixiApp.renderer;
    readonly stage = this.pixiApp.stage;

    constructor({ scales, maxFPS = 60 }: { scales: RequiredScales; maxFPS?: number }) {
        new ResizeObserver(this.renderer, scales);

        debug.fn(() => Reflect.set(globalThis, "__PIXI_APP__", this.pixiApp));

        Ticker.shared.autoStart = false;
        Ticker.shared.start();
        Ticker.shared.maxFPS = maxFPS;
        gsap.ticker.fps(maxFPS);

        const { stage, ticker, view } = this.pixiApp;
        const canvas = view as HTMLCanvasElement;

        stage.interactive = true;
        ticker.maxFPS = maxFPS;

        this.canvasContainer.appendChild(canvas);
        canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    }
}