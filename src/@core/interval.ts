import { di } from "@elumixor/di";
import { Time } from "./time";

/**
 * Executes a given callback every given time interval.
 * @param callback The callback to execute.
 * @param seconds The time interval in seconds.
 */
export class Interval {
    private readonly ms;
    private elapsedMs = 0;

    constructor(
        private readonly callback: () => void,
        seconds: number,
        private readonly time = di.inject(Time),
    ) {
        this.ms = seconds * 1000;
    }

    start() {
        this.elapsedMs = 0;
        this.time.add(this.update);
    }

    resume() {
        this.time.add(this.update);
    }

    pause() {
        this.time.remove(this.update);
    }

    stop() {
        this.elapsedMs = 0;
        this.time.remove(this.update);
    }

    private readonly update = () => {
        this.elapsedMs += this.time.dMs;

        while (this.elapsedMs > this.ms) {
            this.callback();
            this.elapsedMs -= this.ms;
        }
    };
}
