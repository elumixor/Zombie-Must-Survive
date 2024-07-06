import { App } from "@core/app";
import { inject } from "@core/di";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Controls } from "controls";
import { Container, Ticker } from "pixi.js";
import { Sounds } from "sounds";
import { MainScene } from "./main-scene";
import { UI } from "./ui";
import { settings } from "pixi-spine";
import gsap from "gsap";

@responsive
export class Game extends Container implements IResizeObservable {
    private readonly app = inject(App);
    private readonly sounds = inject(Sounds);
    private readonly controls = inject(Controls);
    private readonly mainScene = new MainScene();
    private readonly ui = new UI();

    private _paused = true;

    constructor() {
        super();

        this.app.stage.addChild(this);
        this.addChild(this.mainScene, this.ui);

        this.mainScene.playerDied.subscribe(() => {
            this.paused = true;
            void this.ui.show("restart").then(() => this.restart());
        });

        this.ui.pausePressed.subscribe(() => (this.paused = !this.paused));
    }

    resize({ scale }: IDimensions) {
        this.scale.set(scale);
    }

    start() {
        debug("Starting the game");
        void this.ui.show("start").then(() => this.restart());
    }

    get paused() {
        return this._paused;
    }
    set paused(value: boolean) {
        if (this._paused === value) return;
        this._paused = value;

        debug(value ? "Paused" : "Resumed");

        settings.GLOBAL_AUTO_UPDATE = !value;

        if (value) {
            Ticker.shared.stop();
            gsap.globalTimeline.pause();
        } else {
            Ticker.shared.start();
            gsap.globalTimeline.play();
        }

        this.sounds.muted = value;
        this.controls.disabled = value;

        this.ui.paused = value;
    }

    private restart() {
        this.mainScene.restart();
        this.paused = false;
    }
}
