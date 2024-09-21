import { Game } from "@core";
import { di } from "@elumixor/di";
import { MainLevel } from "./actors/levels";
import "./config";
import { Controls } from "./controls";
import { configurator } from "./config";

/** Game class is responsible for creating all the game classes and managing the scenes */
@di.injectable
export class GameZombie extends Game {
    readonly controls = new Controls();
    private readonly mainLevel = new MainLevel();

    start() {
        logs("Starting the game");

        // We will need to uncomment this later for PROD builds?
        configurator.load(this.resources.get("config")!);

        return this.changeLevel(this.mainLevel);
    }
}
