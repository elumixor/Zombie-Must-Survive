import { injectable } from "@core/di";
import { BaseResources, spine } from "@core/resources";
import type { Spine } from "@core/spine";

@injectable
export class Resources extends BaseResources {
    @spine("spineboy", { extension: "json" })
    declare readonly player: Spine<"death" | "hit" | "idle" | "jump" | "run" | "shoot" | "walk">;

    constructor() {
        super("resources/assets", "resources/html");

        this.mainLoader.add("zombie", `${this.pathTo("sprites")}/zombie.png`);
        this.mainLoader.add("background", `${this.pathTo("sprites")}/background.png`);
        this.mainLoader.add("shuriken", `${this.pathTo("sprites")}/shuriken.png`);
        this.mainLoader.add("crystal", `${this.pathTo("sprites")}/crystal.png`);
    }
}
