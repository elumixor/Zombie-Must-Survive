export class Interval {
    private started = 0;
    private paused = 0;
    private timeoutId = 0;

    constructor(
        private readonly callback: () => void,
        private readonly interval: number,
    ) {}

    pause() {
        window.clearInterval(this.timeoutId);
        this.paused = Date.now();
    }

    resume() {
        this.started += Date.now() - this.paused;
        this.start();
    }

    start() {
        window.clearInterval(this.timeoutId);

        this.started = Date.now();
        const elapsed = Date.now() - this.started;
        const overshoot = elapsed - this.interval * 1000;
        const adjusted = this.interval * 1000 - overshoot;

        this.timeoutId = window.setTimeout(() => {
            this.callback();
            this.start();
        }, adjusted);
    }
}
