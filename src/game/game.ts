import { App } from "@core/app";
import { inject } from "@core/di";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Controls } from "controls";
import { Container, Ticker } from "pixi.js";
import { Sounds } from "sounds";
import { MainScene } from "./main-scene";

@responsive
export class Game extends Container implements IResizeObservable {
    private readonly app = inject(App);
    private readonly sounds = inject(Sounds);
    private readonly controls = inject(Controls);
    private readonly mainScene = new MainScene();

    constructor() {
        super();

        this.app.stage.addChild(this);
        this.addChild(this.mainScene);

        this.mainScene.playerDied.subscribe(() => {
            debug("Player died!");
            this.paused = true;
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

        Ticker.shared.stop();

        this.sounds.muted = value;
        this.controls.disabled = value;
    }
}
