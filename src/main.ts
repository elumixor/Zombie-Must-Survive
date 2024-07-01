import { App } from "@core/app";
import "@core/logger";
import "./style.css";
import { Resources } from "resources";
import { Sounds } from "sounds";
import { Poki } from "poki";
import { Game } from "game";

void (async () => {
    const poki = new Poki();
    await poki.init();

    new App({
        portrait: [640, 960],
        landscape: [960, 640],
    });
    debug("App initialized");

    const resources = new Resources();
    new Sounds();

    await resources.loadMain();
    poki.onLoadingFinished();
    debug("Resources loaded");

    const game = new Game();
    poki.paused.subscribe((paused) => (game.paused = paused));

    await poki.playCommercialBreak();

    await game.start();
})();
