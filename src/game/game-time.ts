import { App } from "@core/app";
import { inject, injectable } from "@core/di";
import { Ticker as PixiTicker } from "pixi.js";
import { gsap } from "gsap";
import { tween01 } from "@core/pixi-utils";
import { lerp } from "@core/utils";

@injectable
export class GameTime {
    readonly ticker = new PixiTicker();

    private readonly app = inject(App);
    private readonly timeline = gsap.timeline();

    constructor() {
        this.ticker.maxFPS = this.app.maxFPS;

        this.timeline.play();
    }

    set paused(value: boolean) {
        if (value) {
            const tickerSpeed = this.ticker.speed;
            const timelineSpeed = this.timeline.timeScale();

            void tween01(0.5, (p) => {
                this.ticker.speed = lerp(p, tickerSpeed, 0.1);
                this.timeline.timeScale(lerp(p, timelineSpeed, 0));
            }).then(() => {
                this.ticker.stop();
                this.timeline.pause();
            });
        } else {
            const tickerSpeed = this.ticker.speed;
            const timelineSpeed = this.timeline.timeScale();

            this.ticker.start();
            this.timeline.play();

            void tween01(0.5, (p) => {
                this.ticker.speed = lerp(p, tickerSpeed, 1);
                this.timeline.timeScale(lerp(p, timelineSpeed, 1));
            });
        }
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
        this.timeline.play();
    }

    stop() {
        this.ticker.stop();
        this.timeline.pause();
    }

    to(target: object, vars: gsap.TweenVars) {
        return this.timeline.to(target, vars);
    }

    fromTo(target: object, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) {
        return this.timeline.fromTo(target, fromVars, toVars);
    }
}
