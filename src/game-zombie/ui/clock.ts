import { Actor } from "@core";
import { TextWidget } from "./text-widget";

export class Clock extends Actor {
    tickEnabled = false;

    private _elapsed = 0;

    private readonly text = this.addChild(
        new TextWidget("00:00", {
            align: "center",
            fontSize: 12,
            stroke: "rgba(0, 0, 0, 0.2)",
            dropShadowDistance: 0,
            dropShadowBlur: 10,
            padding: 10,
        }),
    );

    constructor() {
        super();
        this.layer = "ui";

        this.text.anchor.set(0.5);
    }

    // Set time elapsed in seconds
    private set elapsed(value) {
        this._elapsed = value;
        const minutes = `${floor(value / 60)}`.padStart(2, "0");
        const seconds = `${floor(value % 60)}`.padStart(2, "0");
        this.text.text = `${minutes}:${seconds}`;
    }

    private get elapsed() {
        return this._elapsed;
    }

    override beginPlay() {
        super.beginPlay();
        this.time.interval(() => this.elapsed++, 1);
    }
}
