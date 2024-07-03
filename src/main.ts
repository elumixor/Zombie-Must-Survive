import { App } from "@core/app";
import "@core/logger";
import "./style.css";
import { Resources } from "resources";
import { Sounds } from "sounds";
import { Poki } from "poki";
import { Game } from "game";
import { Controls } from "controls";

void (async () => {
    const poki = new Poki();
    await poki.init();

    new App({
        scales: {
            portrait: [640, 960],
            landscape: [960, 640],
        },
        maxFPS: 120,
    });
    debug("App initialized");

    const resources = new Resources();
    new Sounds();

    await resources.loadMain();
    poki.onLoadingFinished();
    debug("Resources loaded");

    new Controls();
    const game = new Game();
    poki.paused.subscribe((paused) => (game.paused = paused));

    await poki.playCommercialBreak();

    await game.start();
})();
