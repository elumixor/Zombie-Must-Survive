import { injectable } from "@core/di";
import { BaseResources } from "@core/resources";

@injectable
export class Resources extends BaseResources {
    constructor() {
        super("resources/assets", "resources/html");

        this.mainLoader.add("zombie", `${this.pathTo("sprites")}/zombie.png`);
        this.mainLoader.add("background", `${this.pathTo("sprites")}/background.png`);
        this.mainLoader.add("shuriken", `${this.pathTo("sprites")}/shuriken.png`);
        this.mainLoader.add("crystal", `${this.pathTo("sprites")}/crystal.png`);
        this.mainLoader.add("worker", `${this.pathTo("sprites")}/worker.png`);
        this.mainLoader.add("shadow", `${this.pathTo("sprites")}/shadow.png`);
    }
}
