import { Text } from "game/text";
import { Container } from "pixi.js";

export class Clock extends Container {
    private readonly text = new Text("00:00", { align: "center", fontSize: 12, dropShadowDistance: 1 });

    constructor() {
        super();

        this.text.anchor.set(0.5);

        this.addChild(this.text);
    }

    // Set time elapsed in seconds
    set time(value: number) {
        const minutes = `${Math.floor(value / 60)}`.padStart(2, "0");
        const seconds = `${Math.floor(value % 60)}`.padStart(2, "0");
        this.text.text = `${minutes}:${seconds}`;
    }
}
