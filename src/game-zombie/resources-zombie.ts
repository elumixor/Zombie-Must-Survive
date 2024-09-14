import { BaseResources, Spine, spine } from "@core";
import { di } from "@elumixor/di";

export type EnemyAnimation = "attack" | "die" | "run";
export type EnemySpine = Spine<EnemyAnimation>;

@di.injectable
export class ResourcesZombie extends BaseResources {
    @spine("zombie")
    declare readonly zombie: Spine<"animation" | "idle" | "run">;

    /* Enemies */

    @spine("Villager1/villager1")
    declare readonly worker: EnemySpine;

    @spine("Villager2/villager1")
    declare readonly soldier: EnemySpine;

    @spine("Villager3/villager1")
    declare readonly doctor: EnemySpine;

    /* Abilities */

    @spine("Beholder/beholder")
    declare readonly beholder: Spine<"attack" | "idle">;

    @spine("Fart/fart")
    declare readonly fart: Spine<"attack">;

    @spine("Jaw/jaw")
    declare readonly bite: Spine<"attack">;

    @spine("Scream/scream")
    declare readonly scream: Spine<"attack">;

    @spine("Spirit/spirit")
    declare readonly spirit: Spine<"fly">;

    @spine("Vomit/vomit")
    declare readonly pool: Spine<"attack">;

    @spine("Zombiecid/zombiecid")
    declare readonly zombiecide: EnemySpine;

    constructor() {
        super("resources/assets", "resources/html");

        // Environment and pickups
        this.mainLoader.add("background", `${this.pathTo("sprites")}/background.png`);
        this.mainLoader.add("crystal", `${this.pathTo("sprites")}/brain.png`);
        this.mainLoader.add("shadow", `${this.pathTo("sprites")}/shadow.png`);

        // Summons
        this.mainLoader.add("zombiecide", `${this.pathTo("sprites")}/zombiecid.png`);
        this.mainLoader.add("spirit", `${this.pathTo("sprites")}/spirit.png`);
        this.mainLoader.add("bite", `${this.pathTo("sprites")}/ui_abyss_bite.png`);
        this.mainLoader.add("beholder", `${this.pathTo("sprites")}/ui_beholder.png`);

        // Weapons, abilities, and particles
        this.mainLoader.add("cloud", `${this.pathTo("sprites")}/cloud.png`);
        this.mainLoader.add("fart", `${this.pathTo("sprites")}/ui_deadly_fart.png`);
        this.mainLoader.add("lightning", `${this.pathTo("sprites")}/molniya.png`);
        this.mainLoader.add("pool", `${this.pathTo("sprites")}/luzha.png`);
        this.mainLoader.add("vomit", `${this.pathTo("sprites")}/ui_acid_vomit.png`);
        this.mainLoader.add("boomerang", `${this.pathTo("sprites")}/legmerang.png`);
        this.mainLoader.add("frankenzombie", `${this.pathTo("sprites")}/ui_frankenzombie.png`);

        this.mainLoader.add("reflux", `${this.pathTo("sprites")}/ui_reflux.png`);
        this.mainLoader.add("spit", `${this.pathTo("sprites")}/reflux.png`);

        // UI
        this.mainLoader.add("ui-card", `${this.pathTo("sprites")}/ui_ability_card.png`);
        this.mainLoader.add("ui-card-rare", `${this.pathTo("sprites")}/ui_ability_card_rare.png`);
        this.mainLoader.add("ui-star", `${this.pathTo("sprites")}/ui_star.png`);
        this.mainLoader.add("ui-card-label", `${this.pathTo("sprites")}/ui_card_label.png`);
        this.mainLoader.add("ui-ad", `${this.pathTo("sprites")}/ui_ad.png`);

        // Config
        this.mainLoader.add("config", `${this.rootAssetsFolder}/config.json`);
    }
}
