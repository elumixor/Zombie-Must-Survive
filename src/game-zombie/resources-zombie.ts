import { BaseResources, Spine, spine } from "@core";
import { di } from "@elumixor/di";

export type EnemyAnimation = "attack" | "die" | "run";
export type EnemySpine = Spine<EnemyAnimation>;

@di.injectable
export class ResourcesZombie extends BaseResources {
    @spine("zombie/zombie")
    declare readonly zombie: Spine<"animation" | "idle" | "run">;

    /* Enemies */

    @spine("enemies/villager1/villager1")
    declare readonly worker: EnemySpine;

    @spine("enemies/villager2/villager2")
    declare readonly soldier: EnemySpine;

    @spine("enemies/villager3/villager3")
    declare readonly doctor: EnemySpine;

    /* Abilities */

    @spine("abilities/beholder/beholder")
    declare readonly beholder: Spine<"attack" | "idle">;

    @spine("abilities/fart/fart")
    declare readonly fart: Spine<"attack">;

    @spine("abilities/jaw/jaw")
    declare readonly bite: Spine<"attack">;

    @spine("abilities/scream/scream")
    declare readonly scream: Spine<"attack">;

    @spine("abilities/spirit/spirit")
    declare readonly spirit: Spine<"fly">;

    @spine("abilities/vomit/vomit")
    declare readonly pool: Spine<"attack">;

    @spine("abilities/zombiecid/zombiecid")
    declare readonly zombiecide: EnemySpine;

    constructor() {
        super("resources/assets", "resources/html");

        // Environment and pickups
        this.mainLoader.add("background", `${this.pathTo("sprites")}/background.png`);
        this.mainLoader.add("crystal", `${this.pathTo("sprites")}/brain.png`);
        this.mainLoader.add("shadow", `${this.pathTo("sprites")}/shadow.png`);

        // Summons
        this.mainLoader.add("bite", `${this.pathTo("sprites")}/ui_abyss_bite.png`);
        this.mainLoader.add("beholder", `${this.pathTo("sprites")}/ui_beholder.png`);

        // Weapons, abilities, and particles
        this.mainLoader.add("lightning", `${this.pathTo("sprites")}/frankenzombie.png`);
        this.mainLoader.add("spit", `${this.pathTo("sprites")}/reflux.png`);
        this.mainLoader.add("boomerang", `${this.pathTo("sprites")}/legmerang.png`);

        // UI
        this.mainLoader.add("ui-fart", `${this.pathTo("sprites")}/ui_deadly_fart.png`);
        this.mainLoader.add("ui-vomit", `${this.pathTo("sprites")}/ui_acid_vomit.png`);
        this.mainLoader.add("ui-boomerang", `${this.pathTo("sprites")}/legmerang.png`);
        this.mainLoader.add("ui-frankenzombie", `${this.pathTo("sprites")}/ui_frankenzombie.png`);
        this.mainLoader.add("ui-reflux", `${this.pathTo("sprites")}/ui_reflux.png`);
        this.mainLoader.add("ui-spirit", `${this.pathTo("sprites")}/ui_evil_spirit.png`);
        this.mainLoader.add("ui-pool", `${this.pathTo("sprites")}/ui_acid_vomit.png`);
        this.mainLoader.add("ui-zombiecide", `${this.pathTo("sprites")}/ui_zombiecide.png`);

        // UI
        this.mainLoader.add("ui-card", `${this.pathTo("sprites")}/ui_ability_card.png`);
        this.mainLoader.add("ui-card-rare", `${this.pathTo("sprites")}/ui_ability_card_rare.png`);
        this.mainLoader.add("ui-card-label", `${this.pathTo("sprites")}/ui_card_label.png`);
        this.mainLoader.add("ui-star", `${this.pathTo("sprites")}/ui_star.png`);
        this.mainLoader.add("ui-ad", `${this.pathTo("sprites")}/ui_ad.png`);

        // Config
        this.mainLoader.add("config", `${this.rootAssetsFolder}/config.json`);
    }
}
