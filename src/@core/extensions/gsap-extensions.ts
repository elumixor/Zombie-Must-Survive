import { makeSkippable, type ISkippable } from "@core/skipping";
import { EventEmitter } from "@elumixor/frontils";
import gsap from "gsap";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-shadow,@typescript-eslint/no-namespace
    namespace gsap.core {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        export interface Animation {
            asSkippable(options?: { propagate: false }): this & ISkippable;
        }
    }
}

Reflect.defineProperty(gsap.core.Animation.prototype, "asSkippable", {
    value(this: gsap.core.Animation, options?: { propagate: false }) {
        let skipped = false;

        const emitter = new EventEmitter<Omit<gsap.core.Animation, "then">>();

        void this.then((result) => {
            if (skipped) return;
            emitter.emit(result);
        });

        return makeSkippable(
            emitter.nextEvent,
            () => {
                skipped = true;

                // this call would instantly resolve the gsap promise, that's why we need to use Deferred
                // if we try to be smart and specify "suppressEvents: true" we would simply never resolve the promise
                this.progress(1, false);

                emitter.emit(this);
            },
            options?.propagate,
        );
    },
    configurable: true,
});
