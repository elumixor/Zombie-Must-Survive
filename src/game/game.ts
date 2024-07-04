import { App } from "@core/app";
import { inject } from "@core/di";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Container } from "pixi.js";
import { Sounds } from "sounds";
import { MainScene } from "./main-scene";
import { Controls } from "controls";

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
        this.controls.disabled = value;
    }
}
