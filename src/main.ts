import { App } from "@core";
import { GameZombie, ResourcesZombie, SoundsZombie } from "./game-zombie";
import { Poki } from "./poki";
import "./style.css";

void (async () => {
    const poki = new Poki();
    await poki.init();

    new App({
        scales: {
            portrait: [1000, 1000],
            landscape: [1000, 1000],
        },
        maxFPS: 120,
    });

    logs("PIXI App initialized");

    const resources = new ResourcesZombie();
    new SoundsZombie();

    await resources.loadMain();
    poki.onLoadingFinished();
    logs("Resources loaded");

    const game = new GameZombie();
    poki.addStarted.subscribe(() => game.advertisementStarted());

    await poki.playCommercialBreak();

    void game.start();
})();
