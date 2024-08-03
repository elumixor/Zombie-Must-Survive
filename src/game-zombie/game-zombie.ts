import { Game } from "@core";
import { injectable } from "@core/di";
import { Controls } from "./controls";
import { MainLevel } from "./actors/levels";

/** Game class is responsible for creating all the game classes and managing the scenes */
@injectable
export class GameZombie extends Game {
    readonly controls = new Controls();
    private readonly mainLevel = new MainLevel();

    start() {
        logs("Starting the game");
        return this.changeLevel(this.mainLevel);
    }
}
