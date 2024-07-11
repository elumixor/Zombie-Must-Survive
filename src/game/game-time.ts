import { App } from "@core/app";
import { inject, injectable } from "@core/di";
import { Ticker as PixiTicker } from "pixi.js";
import { gsap } from "gsap";

@injectable
export class GameTime {
    readonly ticker = new PixiTicker();

    private readonly app = inject(App);

    constructor() {
        this.ticker.maxFPS = this.app.maxFPS;
    }

    set paused(value: boolean) {
        void gsap.to(this.ticker, { speed: value ? 0.1 : 1, duration: 1 }).then(() => {
            if (value) this.ticker.stop();
            else this.ticker.start();
        });
    }

    add(callback: (delta: number) => void) {
        this.ticker.add(callback);
    }

    addOnce(callback: (delta: number) => void) {
        this.ticker.addOnce(callback);
    }

    remove(callback: (delta: number) => void) {
        this.ticker.remove(callback);
    }

    start() {
        this.ticker.start();
    }

    stop() {
        this.ticker.stop();
    }
}
