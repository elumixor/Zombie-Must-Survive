import { responsive } from "@core";
import { all } from "@elumixor/frontils";
import { ButtonWidget } from "../button-widget";
import { TextWidget } from "../text-widget";
import { Popup } from "./popup";
import { gsap } from "gsap";

@responsive
export class GameOverPopup extends Popup {
    @responsive({ anchor: 0.5, y: -200 })
    private readonly gameOverText = this.container.addChild(
        new TextWidget("GAME OVER", {
            fontSize: 60,
            fill: "rgb(255, 0, 0)",
            dropShadowDistance: 5,
            fontWeight: "900",
        }),
    );

    private readonly restartButton = this.container.addChild(
        new ButtonWidget({
            text: "RESTART",
            width: 250,
            height: 75,
            color: "rgb(60, 24, 102)",
            borderColor: "rgb(151, 255, 110)",
            textStyle: { fontSize: 40, fill: "rgb(151, 255, 110)" },
        }),
    );

    async show() {
        await all(
            super.show(),
            gsap.fromTo(this.gameOverText, { y: -150, alpha: 0 }, { y: -200, alpha: 1, duration: 1, delay: 0.5 }),
            gsap.fromTo(this.restartButton, { y: 50, alpha: 0 }, { y: 0, alpha: 1, duration: 1, delay: 1 }),
            gsap.fromTo(this.restartButton.scale, { x: 0.9, y: 0.9 }, { x: 1.2, y: 1.2, duration: 0.75, delay: 1 }),
        );

        gsap.to(this.restartButton.scale, { x: 1, y: 1, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

        return this.restartButton.clicked.nextEvent;
    }
}
