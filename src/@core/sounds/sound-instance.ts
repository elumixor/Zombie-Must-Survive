import { Howl, type HowlOptions } from "howler";
import { EventEmitter } from "@elumixor/frontils";
import { tweenNumber } from "@core/pixi-utils";

export interface ISoundInstanceParameters extends HowlOptions {
    volume: number;
    stereo: number;
    logged?: boolean | "warn";
}

export class SoundInstance extends Howl implements PromiseLike<void> {
    readonly [Symbol.toStringTag]!: string;

    readonly stopped = new EventEmitter();

    protected readonly descriptiveName;

    constructor(protected readonly properties: ISoundInstanceParameters) {
        super(properties);

        this[Symbol.toStringTag] = `SoundInstance ${String(this.properties.src)}`;
        const src = Array.isArray(this.properties.src) ? this.properties.src.first : this.properties.src;
        this.descriptiveName = src.split("/").last.split(".").first;

        void this.on(properties.loop ? "stop" : "end", () => this.stopped.emit());
    }

    then<TResult1 = void, TResult2 = never>(
        // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    ): PromiseLike<TResult1 | TResult2> {
        return this.stopped.nextEvent.then(onfulfilled, onrejected);
    }

    fadeIn(duration: number) {
        return tweenNumber(this.volume(), this.properties.volume, duration, (value) => void this.volume(value));
    }

    fadeOut(duration: number) {
        return tweenNumber(this.volume(), 0, duration, (value) => void this.volume(value));
    }
}
