import { responsive } from "@core";
import { all, EventEmitter } from "@elumixor/frontils";
import { ButtonWidget } from "../button-widget";
import { TextWidget } from "../text-widget";
import { Popup } from "./popup";
import { gsap } from "gsap";
import { Sprite } from "pixi.js";

@responsive
export class GameOverPopup extends Popup {
    @responsive({ anchor: 0.5, y: -200 })
    private readonly background = this.container.addChild(Sprite.from("ui-game-over"));

    @responsive({ anchor: 0.5, y: -75 })
    private readonly gameOverText = this.background.addChild(
        new TextWidget("DEAD", {
            fontSize: 40,
            dropShadowDistance: 5,
        }),
    );

    private readonly dieButton = this.background.addChild(
        new ButtonWidget({
            text: "DIE",
            sprite: Sprite.from("ui-die"),
            width: 75,
            height: 40,
            fit: false,
            textStyle: { fontSize: 20, letterSpacing: 1 },
        }),
    );

    private readonly reviveButton = this.background.addChild(
        new ButtonWidget({
            text: "REVIVE",
            sprite: Sprite.from("ui-revive"),
            width: 75,
            height: 40,
            fit: false,
            textStyle: { fontSize: 20, letterSpacing: 1 },
        }),
    );

    private readonly resultEvent = new EventEmitter<"die" | "revive">();

    constructor() {
        super();

        this.dieButton.clicked.subscribe(() => this.resultEvent.emit("die"));
        this.reviveButton.clicked.subscribe(() => this.resultEvent.emit("revive"));
        this.reviveButton.textElement.x -= 20;
        this.dieButton.textElement.x -= 25;
    }

    override async show() {
        gsap.to(this.reviveButton.scale, {
            x: 1,
            y: 1,
            duration: 2,
            delay: 1.2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
        });

        await all(
            super.show(),
            gsap.fromTo(this.background, { y: -150, alpha: 0 }, { y: -200, alpha: 1, duration: 1, delay: 0.5 }),
            gsap.fromTo(this.reviveButton, { y: 200, alpha: 0 }, { y: 175, alpha: 1, duration: 1, delay: 0.5 }),
            gsap.fromTo(this.reviveButton.scale, { x: 0.9, y: 0.9 }, { x: 1.2, y: 1.2, duration: 0.75, delay: 0.5 }),
            gsap.fromTo(this.dieButton, { y: 300, alpha: 0 }, { y: 250, alpha: 1, duration: 1, delay: 1.5 }),
            gsap.fromTo(this.dieButton.scale, { x: 0.9, y: 0.9 }, { x: 1, y: 1, duration: 0.75, delay: 1.5 }),
        );

        return this.resultEvent.nextEvent;
    }
}
