import { di } from "@elumixor/di";
import { getElementOrThrow } from "@elumixor/frontils";
import { Stage } from "@pixi/layers";
import { gsap } from "gsap";
import { Application, Container, isMobile, Ticker } from "pixi.js";
import { Resizer, type RequiredScales } from "./responsive";

declare global {
    interface Window {
        resolution: number;
    }
}

@di.injectable
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
    // readonly stage = this.pixiApp.stage;
    readonly stage = new Stage();
    readonly view = this.pixiApp.view as HTMLCanvasElement;
    readonly maxFPS;

    readonly isMobile = isMobile.any;
    readonly isDesktop = !this.isMobile;

    constructor({ scales, maxFPS = 60 }: { scales: RequiredScales; maxFPS?: number }) {
        this.pixiApp.stage = this.stage;
        this.stage.group.enableSort = true;

        new Resizer(this.renderer, scales);

        this.maxFPS = maxFPS;

        debug.fn(() => Reflect.set(globalThis, "__PIXI_APP__", this.pixiApp));

        Ticker.shared.autoStart = false;
        Ticker.shared.start();
        Ticker.shared.maxFPS = maxFPS;
        gsap.ticker.fps(maxFPS);

        this.pixiApp.ticker.maxFPS = maxFPS;

        this.canvasContainer.appendChild(this.view);
        this.view.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    addChild(child: Container) {
        this.stage.addChild(child);
    }

    removeChild(child: Container) {
        this.stage.removeChild(child);
    }
}
