import { App } from "@core/app";
import { di } from "@elumixor/di";
import { EventEmitter } from "@elumixor/frontils";
import { gsap } from "gsap";
import { settings as SpineSettings } from "pixi-spine";
import { Ticker } from "pixi.js";

export type TickFn = (dt: number) => void;

@di.injectable
export class Time {
    readonly pausedChanged = new EventEmitter<boolean>();
    private readonly app = di.inject(App);
    private readonly tweens = new Array<gsap.core.Tween>();
    private readonly uniqueTickCallbacks = new Set<TickFn>();
    private readonly ticker = new Ticker();
    private _paused = false;

    constructor() {
        this.ticker.maxFPS = this.app.maxFPS;
    }

    /** The current speed that the ticker is running at */
    get speed() {
        return this.ticker.speed;
    }

    /** Sets the speed of the ticker. This also affects all current tweens */
    set speed(value) {
        this.ticker.speed = value;
        for (const tween of this.tweens) tween.timeScale(value);
    }

    /** Pauses or resumes the ticker */
    get paused() {
        return this._paused;
    }
    set paused(value: boolean) {
        this._paused = value;
        SpineSettings.GLOBAL_AUTO_UPDATE = !value;

        if (value) {
            this.ticker.stop();
            for (const tween of this.tweens) tween.pause();
        } else {
            this.ticker.start();
            for (const tween of this.tweens) tween.resume();
        }

        this.pausedChanged.emit(value);
    }

    /** The time since the last tick in milliseconds */
    get dMs() {
        return this.ticker.deltaMS;
    }

    /** Time scale of the last frame */
    get dt() {
        return this.ticker.deltaTime;
    }

    /** Adds a callback to be run on every tick. Note: does not prevent adding the same callback multiple times */
    add(callback: TickFn) {
        this.ticker.add(callback);
    }

    /** Like {@link add} but ensures that the callback is only added once to the ticker */
    addUnique(callback: TickFn) {
        if (this.uniqueTickCallbacks.has(callback)) return;
        this.uniqueTickCallbacks.add(callback);
        this.ticker.add(callback);
    }

    /** Returns a promise that resolves on the next tick */
    nextTick() {
        return new Promise<void>((resolve) => this.ticker.addOnce(() => resolve()));
    }

    /** Removes a callback from the ticker */
    remove(callback: TickFn) {
        this.ticker.remove(callback);
        this.uniqueTickCallbacks.delete(callback);
    }

    /** Starts the ticker */
    start() {
        this.ticker.start();
        for (const tween of this.tweens) tween.play();
    }

    /** Stops the ticker */
    stop() {
        this.ticker.stop();
        for (const tween of this.tweens) tween.pause();
    }

    reset() {
        for (const tween of this.tweens) tween.kill();
        this.tweens.clear();
    }

    /** Like {@link gsap.to} but respects the current speed of the game */
    to(target: object, vars: gsap.TweenVars) {
        const tween: gsap.core.Tween = gsap.to(target, { ...vars, onInterrupt: () => this.tweens.remove(tween) });
        tween.timeScale(this.speed);
        this.tweens.push(tween);
        void tween.then(() => this.tweens.remove(tween));
        return tween;
    }

    /** Like {@link gsap.fromTo} but respects the current speed of the game */
    fromTo(target: object, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) {
        const tween: gsap.core.Tween = gsap.fromTo(target, fromVars, {
            ...toVars,
            onInterrupt: () => this.tweens.remove(tween),
        });
        tween.timeScale(this.speed);
        this.tweens.push(tween);
        void tween.then(() => this.tweens.remove(tween));
        return tween;
    }

    /**
     * Returns a promise that resolves after a specified number of seconds.
     * Respects the current speed of the game.
     */
    delay(seconds: number) {
        return new Promise<void>((resolve) => this.timeout(resolve, seconds));
    }

    /** Executes a callback every specified number of seconds. Respects the current speed of the game */
    interval(callback: () => void, seconds: number) {
        let elapsed = 0;
        const ms = seconds * 1000;
        const callbackWrapper = () => {
            elapsed += this.dMs;
            if (elapsed >= ms) {
                callback();
                elapsed -= ms;
            }
        };
        this.add(callbackWrapper);

        return {
            clear: () => this.remove(callbackWrapper),
        };
    }

    /** Executes a callback once after specified number of seconds. Respects the current speed of the game */
    timeout(callback: () => void, seconds: number) {
        const interval = this.interval(() => {
            callback();
            interval.clear();
        }, seconds);

        return { clear: interval.clear };
    }
}

export type Interval = ReturnType<Time["interval"]>;
export type Timeout = ReturnType<Time["timeout"]>;
