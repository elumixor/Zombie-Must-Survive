import { inject } from "@core/di";
import { GameTime } from "./game-time";

/**
 * Executes a given callback every given time interval.
 * @param callback The callback to execute.
 * @param seconds The time interval in seconds.
 */
export class Interval {
    private readonly time = inject(GameTime);
    private readonly ticker = this.time.ticker;
    private readonly ms;
    private elapsedMs = 0;

    constructor(
        private readonly callback: () => void,
        seconds: number,
    ) {
        this.ms = seconds * 1000;
    }

    start() {
        this.elapsedMs = 0;
        this.ticker.add(this.update);
    }

    resume() {
        this.ticker.add(this.update);
    }

    pause() {
        this.ticker.remove(this.update);
    }

    stop() {
        this.elapsedMs = 0;
        this.ticker.remove(this.update);
    }

    private readonly update = () => {
        this.elapsedMs += this.ticker.deltaMS;

        while (this.elapsedMs > this.ms) {
            this.callback();
            this.elapsedMs -= this.ms;
        }
    };
}
