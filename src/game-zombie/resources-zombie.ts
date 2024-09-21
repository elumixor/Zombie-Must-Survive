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
    declare readonly villager1: EnemySpine;

    @spine("enemies/villager2/villager2")
    declare readonly villager2: EnemySpine;

    @spine("enemies/villager3/villager3")
    declare readonly villager3: EnemySpine;

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

        const sprites = this.pathTo("sprites");

        // Environment and pickups
        this.mainLoader.add("background", `${sprites}/background.png`);
        this.mainLoader.add("crystal", `${sprites}/brain.png`);
        this.mainLoader.add("shadow", `${sprites}/shadow.png`);

        // Summons
        this.mainLoader.add("bite", `${sprites}/ui_abyss_bite.png`);
        this.mainLoader.add("beholder", `${sprites}/ui_beholder.png`);

        // Weapons, abilities, and particles
        this.mainLoader.add("lightning", `${sprites}/frankenzombie.png`);
        this.mainLoader.add("spit", `${sprites}/reflux.png`);
        this.mainLoader.add("boomerang", `${sprites}/legmerang.png`);

        // UI
        this.mainLoader.add("ui-fart", `${sprites}/ui_deadly_fart.png`);
        this.mainLoader.add("ui-vomit", `${sprites}/ui_acid_vomit.png`);
        this.mainLoader.add("ui-boomerang", `${sprites}/legmerang.png`);
        this.mainLoader.add("ui-frankenzombie", `${sprites}/ui_frankenzombie.png`);
        this.mainLoader.add("ui-reflux", `${sprites}/ui_reflux.png`);
        this.mainLoader.add("ui-spirit", `${sprites}/ui_evil_spirit.png`);
        this.mainLoader.add("ui-pool", `${sprites}/ui_acid_vomit.png`);
        this.mainLoader.add("ui-zombiecide", `${sprites}/ui_zombiecide.png`);

        // UI
        this.mainLoader.add("ui-card", `${sprites}/ui_ability_card.png`);
        this.mainLoader.add("ui-card-rare", `${sprites}/ui_ability_card_rare.png`);
        this.mainLoader.add("ui-card-label", `${sprites}/ui_card_label.png`);
        this.mainLoader.add("ui-star", `${sprites}/ui_star.png`);
        this.mainLoader.add("ui-ad", `${sprites}/ui_ad.png`);

        // Config
        this.mainLoader.add("config", `${this.rootAssetsFolder}/config.json`);
    }
}
