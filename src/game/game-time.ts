import { App } from "@core/app";
import { inject, injectable } from "@core/di";
import { Ticker as PixiTicker } from "pixi.js";
import { gsap } from "gsap";

@injectable
export class GameTime {
    readonly ticker = new PixiTicker();

    private readonly app = inject(App);
    private readonly tweens = new Array<gsap.core.Tween>();

    constructor() {
        this.ticker.maxFPS = this.app.maxFPS;
    }

    get speed() {
        return this.ticker.speed;
    }

    set speed(value) {
        this.ticker.speed = value;
        for (const tween of this.tweens) tween.timeScale(value);
    }

    set paused(value: boolean) {
        if (value) {
            void gsap.to(this, { speed: 0.1, duration: 0.5 }).then(() => {
                this.ticker.stop();
                for (const tween of this.tweens) tween.pause();
            });
        } else {
            this.ticker.start();
            for (const tween of this.tweens) tween.play();

            void gsap.to(this, { speed: 1, duration: 0.5 });
        }
    }

    get deltaMs() {
        return this.ticker.deltaMS;
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
        for (const tween of this.tweens) tween.play();
    }

    stop() {
        this.ticker.stop();
        for (const tween of this.tweens) tween.pause();
    }

    to(target: object, vars: gsap.TweenVars) {
        const tween = gsap.to(target, vars);
        tween.timeScale(this.speed);
        this.tweens.push(tween);
        void tween.then(() => this.tweens.remove(tween));
        return tween;
    }

    fromTo(target: object, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) {
        const tween = gsap.fromTo(target, fromVars, toVars);
        tween.timeScale(this.speed);
        this.tweens.push(tween);
        void tween.then(() => this.tweens.remove(tween));
        return tween;
    }
}
