import { App } from "@core/app";
import { inject } from "@core/di";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Controls } from "controls";
import { Container } from "pixi.js";
import { Sounds } from "sounds";
import { MainScene } from "./main-scene";
import { GameUI } from "./ui/game-ui";
import { settings } from "pixi-spine";
import { GameTime } from "./game-time";

@responsive
export class Game extends Container implements IResizeObservable {
    private readonly app = inject(App);
    private readonly sounds = inject(Sounds);
    private readonly controls = new Controls();
    private readonly gameTime = new GameTime();
    private readonly mainScene = new MainScene();
    private readonly ui = new GameUI();

    private _paused = true;

    constructor() {
        super();

        this.app.stage.addChild(this);
        this.addChild(this.mainScene, this.ui);

        this.mainScene.playerDied.subscribe(() => {
            this.paused = true;
            void this.ui.show("restart").then(() => this.restart());
        });

        this.mainScene.stageCompleted.subscribe(() => {
            this.paused = true;
            void this.ui.show("next").then(() => this.restart());
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

        // TODO: we will need Spines to be subscribed to the game time instead of the global ticker
        settings.GLOBAL_AUTO_UPDATE = !value;
        this.gameTime.paused = value;

        this.sounds.muted = value;
        this.controls.disabled = value;

        this.ui.paused = value;
    }

    private restart() {
        this.gameTime.start();
        this.mainScene.restart();
        this.paused = false;
    }
}
