import { BaseResources, Spine, spine } from "@core";
import { di } from "@elumixor/di";

@di.injectable
export class ResourcesZombie extends BaseResources {
    @spine("zombie")
    declare readonly zombie: Spine<"animation" | "idle" | "run">;

    constructor() {
        super("resources/assets", "resources/html");

        // Environment and pickups
        this.mainLoader.add("background", `${this.pathTo("sprites")}/background.png`);
        this.mainLoader.add("crystal", `${this.pathTo("sprites")}/crystal.png`);
        this.mainLoader.add("shadow", `${this.pathTo("sprites")}/shadow.png`);

        // Characters
        this.mainLoader.add("worker", `${this.pathTo("sprites")}/builder.png`);
        this.mainLoader.add("soldier", `${this.pathTo("sprites")}/soldier.png`);
        this.mainLoader.add("doctor", `${this.pathTo("sprites")}/medic.png`);

        // Summons
        this.mainLoader.add("zombie-child", `${this.pathTo("sprites")}/zombiecid.png`);
        this.mainLoader.add("spirit", `${this.pathTo("sprites")}/spirit.png`);

        // Weapons and particles
        this.mainLoader.add("spit", `${this.pathTo("sprites")}/plevok.png`);
        this.mainLoader.add("cloud", `${this.pathTo("sprites")}/cloud.png`);
        this.mainLoader.add("lightning", `${this.pathTo("sprites")}/molniya.png`);
        this.mainLoader.add("acid", `${this.pathTo("sprites")}/luzha.png`);
        this.mainLoader.add("boomerang", `${this.pathTo("sprites")}/boomerang_leg.png`);
    }
}
