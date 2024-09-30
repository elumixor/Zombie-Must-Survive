import type { IPool, IPooledInstance } from "@core/pooling";
import { makeSkippable, type ISkippable } from "@core/skipping";
import { EventEmitter, type Awaitable } from "@elumixor/frontils";
import * as PIXISpine from "pixi-spine";
import { Container } from "pixi.js";

const resolved = Promise.resolve();
const dummySkip = () => undefined;

/**
 * Extracts spine animations type name from the {@link Spine} type
 */
export type SpineAnimations<T extends Spine> = T extends Spine<infer U> ? U : never;

/** @deprecated type to eliminate error when switching to a new version */
export type TrackEntryMutable = PIXISpine.ITrackEntry & { animation: PIXISpine.IAnimation };

/**
 * Simplified API for the PIXI.Spine class.
 */
export class Spine<
        TAnimation extends string = string,
        TEvent extends string = string,
        TPlaceholder extends string = string,
    >
    extends PIXISpine.Spine
    implements IPooledInstance
{
    readonly events;
    protected readonly animationEnded = new EventEmitter();

    constructor(
        skeletonData: PIXISpine.ISkeletonData,
        protected readonly pool?: IPool<Spine<TAnimation>>,
    ) {
        super(skeletonData);

        this.state.addListener({ complete: () => this.animationEnded.emit() });

        // Log all the events
        this.events = Object.fromEntries(
            this.state.data.skeletonData.events.map((animation) => [animation.name, new EventEmitter()]),
        ) as Record<TEvent, EventEmitter>;

        this.state.addListener({ event: (_entry, event) => this.events[event.data.name as TEvent].emit() });
    }

    set skin(value: string) {
        this.skeleton.setSkinByName(value);
    }

    get animations() {
        return this.skeleton.data.animations.map(({ name }) => name);
    }

    get speed() {
        return this.state.timeScale;
    }
    set speed(value) {
        this.state.timeScale = value;
    }

    get currentAnimation() {
        return (this.state.tracks.first as { animation?: PIXISpine.IAnimation } | undefined)?.animation;
    }

    onObtain() {
        this.position.set(0);
        this.reset();
    }

    // onEvent(callback: () => void) {
    //     this.state.addListener({ event: callback });
    // }

    release() {
        this.pool?.release(this);
    }

    copy() {
        return new Spine<TAnimation>(this.skeleton.data, this.pool);
    }

    animate(animationName: TAnimation, options?: { loop: boolean; mixDuration?: number }): void;
    animate(
        animationName: TAnimation,
        options: { instantly: true } | { speed: number; loop?: boolean; mixDuration?: number },
    ): void;
    animate(
        animationName: TAnimation,
        options: { promise: true; loop?: boolean; speed?: number; mixDuration?: number },
    ): Promise<void>;
    animate(
        animationName: TAnimation,
        options: {
            skippable: true;
            loop?: boolean;
            speed?: number;
            propagate?: false;
            mixDuration?: number;
        },
    ): ISkippable & Promise<void>;
    animate(
        animationName: TAnimation,
        options?: {
            loop?: boolean;
            speed?: number;
            promise?: true;
            skippable?: true;
            propagate?: false;
            instantly?: true;
            mixDuration?: number;
        },
    ): Awaitable {
        const {
            promise = false,
            loop = false,
            skippable = false,
            speed = 1,
            instantly = false,
            propagate,
            mixDuration = 0,
        } = options ?? {};

        this.reset(mixDuration === 0);

        const entry = this.state.setAnimation(0, animationName, loop);
        entry.mixDuration = mixDuration;

        // const animationDuration = entry.animation.duration;
        const animationDuration = entry.animationEnd;
        const isEmpty = animationDuration === 0;

        if (instantly) {
            entry.trackTime = animationDuration;
            entry.timeScale = 0;
            return;
        }

        entry.timeScale = speed;

        if (!promise && !skippable) return;

        if (isEmpty) {
            if (!skippable) return resolved;

            return makeSkippable(resolved, dummySkip, propagate);
        }

        this.animationEnded.emit();
        const deferred = this.animationEnded.nextEvent;

        if (!skippable) return deferred;

        return makeSkippable(
            deferred,
            () => {
                entry.trackTime = animationDuration;
                entry.timeScale = 0;
                this.animationEnded.emit();
            },
            propagate,
        );
    }

    stopAnimations() {
        this.state.setEmptyAnimation(0, 0);
        this.animationEnded.emit();
    }

    reset(clearTracks = true) {
        if (clearTracks) this.state.clearTracks();
        this.skeleton.setToSetupPose();
        this.lastTime = 0;
        this.animationEnded.emit();
    }

    getSlot<R extends Container>(slotName: TPlaceholder) {
        return this.skeleton.findSlot(slotName).currentSprite as R;
    }
}
