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
        this.mainLoader.add("zombiecide", `${this.pathTo("sprites")}/zombiecid.png`);
        this.mainLoader.add("spirit", `${this.pathTo("sprites")}/spirit.png`);
        this.mainLoader.add("bite", `${this.pathTo("sprites")}/ui_abyss_bite.png`);
        this.mainLoader.add("beholder", `${this.pathTo("sprites")}/ui_beholder.png`);

        // Weapons, abilities, and particles
        this.mainLoader.add("spit", `${this.pathTo("sprites")}/plevok.png`);
        this.mainLoader.add("cloud", `${this.pathTo("sprites")}/cloud.png`);
        this.mainLoader.add("fart", `${this.pathTo("sprites")}/ui_deadly_fart.png`);
        this.mainLoader.add("lightning", `${this.pathTo("sprites")}/molniya.png`);
        this.mainLoader.add("lake", `${this.pathTo("sprites")}/luzha.png`);
        this.mainLoader.add("vomit", `${this.pathTo("sprites")}/ui_acid_vomit.png`);
        this.mainLoader.add("boomerang", `${this.pathTo("sprites")}/boomerang_leg.png`);
        this.mainLoader.add("frankenzombie", `${this.pathTo("sprites")}/ui_frankenzombie.png`);
        this.mainLoader.add("reflux", `${this.pathTo("sprites")}/ui_reflux.png`);

        // UI
        this.mainLoader.add("ui-card", `${this.pathTo("sprites")}/ui_ability_card.png`);
        this.mainLoader.add("ui-card-rare", `${this.pathTo("sprites")}/ui_ability_card_rare.png`);
        this.mainLoader.add("ui-star", `${this.pathTo("sprites")}/ui_star.png`);
        this.mainLoader.add("ui-card-label", `${this.pathTo("sprites")}/ui_card_label.png`);
        this.mainLoader.add("ui-ad", `${this.pathTo("sprites")}/ui_ad.png`);
    }
}
