import { rectSprite } from "@core/pixi-utils";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import gsap from "gsap";
import { Container } from "pixi.js";
import { Button } from "./button";
import { Text } from "../text";

@responsive
export class GameUI extends Container implements IResizeObservable {
    readonly pausePressed;

    private readonly overlay = rectSprite({ color: 0x000000, alpha: 0.5 });

    private readonly startButton = new Button({ text: "START", textStyle: { fontSize: 20 } });

    @responsive({ pin: [1, 0], x: -10, y: 10, anchor: [1, 0] })
    private readonly pauseText = new Text("PAUSE");

    @responsive({ pin: 0.5 })
    private readonly buttonsContainer = new Container();

    constructor() {
        super();

        this.pauseText.interactive = true;
        this.pauseText.cursor = "pointer";

        this.addChild(this.overlay, this.buttonsContainer, this.pauseText);

        this.buttonsContainer.addChild(this.startButton);

        this.pausePressed = this.pauseText.pressed.pipe();
    }

    async show(mode: "start" | "restart") {
        this.startButton.text = mode.toUpperCase();

        void this.startButton.show();

        await this.startButton.clicked.nextEvent;

        void this.startButton.hide();
    }

    resize({ width, height }: IDimensions) {
        this.overlay.width = width;
        this.overlay.height = height;
    }

    set paused(value: boolean) {
        if (value) this.addChildAt(this.overlay, 0);
        this.overlay.interactive = value;

        void gsap.to(this.overlay, { alpha: value ? 1 : 0, duration: 0.5 }).then(() => {
            if (!value) this.removeChild(this.overlay);
        });
        gsap.to(this.buttonsContainer, { alpha: value ? 1 : 0, duration: 0.5 });
        this.startButton.disabled = !value;
    }
}
