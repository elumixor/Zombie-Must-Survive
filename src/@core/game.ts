import { App } from "@core/app";
import { di } from "@elumixor/di";
import { configurator } from "game-zombie/config";
import type { Level } from "./level";
import { BaseResources } from "./resources";
import { Time } from "./time";

/** Game class is responsible for creating all the game classes and managing the levels */
@di.injectable
export class Game {
    protected readonly app = di.inject(App);
    protected readonly resources = di.inject(BaseResources);

    /** Instantiate game-wide time manager */
    protected readonly time = new Time();

    /** Currently loaded level */
    protected _currentLevel?: Level;

    constructor() {
        this.time.start();

        debug.fn(() => {
            // Debug slowdown and pause on keypress
            document.addEventListener("keydownonce", (e) => {
                if (e.code === "KeyP") this.time.paused = !this.time.paused;
                if (e.code === "Space") this.time.speed = 0.2;
            });
            document.addEventListener("keyup", (e) => {
                if (e.code === "Space") this.time.speed = 1;
            });

            // Make accessible for debugging
            Reflect.defineProperty(globalThis, "game", { value: this });

            // Add fps counter
            const fpsCounter = document.createElement("div");
            fpsCounter.id = "__fps-counter";
            fpsCounter.style.position = "fixed";
            fpsCounter.style.top = "50px";
            fpsCounter.style.right = "0";
            fpsCounter.style.zIndex = "9999";
            fpsCounter.style.color = "rgb(255 255 255)";
            fpsCounter.style.textShadow = "0 0 25px black";
            fpsCounter.style.fontFamily = "monospace";
            fpsCounter.style.fontSize = "14px";
            fpsCounter.style.fontWeight = "medium";
            fpsCounter.style.padding = "8px";
            fpsCounter.style.pointerEvents = "none";
            document.body.appendChild(fpsCounter);

            this.time.add(() => (fpsCounter.textContent = `FPS: ${round(1000 / this.time.dMs)}`));
        });

        configurator.visible = false;
        configurator.reloadRequested.subscribe((id) =>
            configurator.load(this.resources.get("config")!, { reset: id ?? true }),
        );
    }

    get currentLevel() {
        return this._currentLevel;
    }

    async changeLevel(level: Level) {
        const { currentLevel } = this;
        if (currentLevel) {
            this.app.removeChild(currentLevel);
            await currentLevel.onUnloaded();
        }

        this._currentLevel = level;

        this.app.addChild(level);
        await level.onLoaded();
    }

    /** When the advertisement is started */
    advertisementStarted() {
        // Pause the game?
    }
}
