import { Game } from "@core";
import { di } from "@elumixor/di";
import { MainLevel } from "./actors/levels";
import { Controls } from "./controls";

/** Game class is responsible for creating all the game classes and managing the scenes */
@di.injectable
export class GameZombie extends Game {
    readonly controls = new Controls();
    private readonly mainLevel = new MainLevel();

    start() {
        logs("Starting the game");
        return this.changeLevel(this.mainLevel);
    }
}
