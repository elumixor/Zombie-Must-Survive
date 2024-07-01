import { injectable } from "@core/di";
import { BaseResources, spine } from "@core/resources";
import type { Spine } from "@core/spine";

@injectable
export class Resources extends BaseResources {
    @spine("spineboy-ess", { extension: "json" })
    declare readonly spineBoy: Spine;

    constructor() {
        super("resources/assets", "resources/html");

        this.mainLoader.add("spritesheet", `${this.pathTo("sprites")}/spritesheet.json`);
        this.mainLoader.add("quadrocopter", `${this.pathTo("sprites")}/quadrocopter.jpg`);
    }
}
