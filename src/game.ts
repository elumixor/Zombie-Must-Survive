import { App } from "@core/app";
import { inject } from "@core/di";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Container } from "pixi.js";
import { Sounds } from "sounds";
import { rectSprite } from "@core/pixi-utils";
import { Sprite } from "pixi.js";
import { Resources } from "resources";

@responsive
export class Game extends Container implements IResizeObservable {
    private app = inject(App);
    private sounds = inject(Sounds);
    private resources = inject(Resources);

    @responsive({ pin: 0.5 })
    private readonly sprite = rectSprite({ width: 100, height: 100, color: 0xff0000 });

    constructor() {
        super();

        this.app.stage.addChild(this);

        this.sprite.anchor.set(0.5);

        const img = Sprite.from("quadrocopter");
        img.position.set(100, 100);

        const buyFeatureImage = Sprite.from("buy-feature-image.png");
        buyFeatureImage.position.set(200, 200);

        const spine = this.resources.spineBoy;
        spine.position.set(500, 1000);
        spine.animate("idle", { loop: true });
        this.addChild(img, buyFeatureImage, spine, this.sprite);

        const imgElement = document.createElement("img");
        imgElement.src = `${this.resources.pathTo("html")}/quadrocopter.jpg`;
        imgElement.style.position = "absolute";
        imgElement.style.top = "0";
        imgElement.style.right = "0";
        imgElement.style.width = "100px";
        imgElement.style.height = "100px";
        this.app.canvasContainer.appendChild(imgElement);

        const win = this.sounds.sound;

        document.addEventListener("keydown", (e) => {
            if (e.key === "s") void win.play();
        });
    }

    resize({ scale }: IDimensions) {
        this.scale.set(scale);
    }

    start() {
        debug("Starting the game");
        return Promise.resolve();
    }

    set paused(value: boolean) {
        debug(value ? "Paused" : "Resumed");

        this.sounds.muted = value;
        // disable keyboard if needed?
    }
}
