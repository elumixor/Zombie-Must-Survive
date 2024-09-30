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

        // Weapons, abilities, and particles
        this.mainLoader.add("lightning", `${sprites}/frankenzombie.png`);
        this.mainLoader.add("spit", `${sprites}/reflux.png`);
        this.mainLoader.add("boomerang", `${sprites}/legmerang.png`);

        const ui = `${sprites}/ui`;

        // UI - General
        this.mainLoader.add("ui-ad", `${ui}/ui_ad.png`);
        this.mainLoader.add("ui-label-bg", `${ui}/ad-text-label.png`);
        this.mainLoader.add("ui-clip", `${ui}/ad-ability-clip.png`);
        this.mainLoader.add("ui-ability-arrow", `${ui}/ability-arrow.png`);
        this.mainLoader.add("ui-card", `${ui}/ability-card.png`);
        this.mainLoader.add("ui-card-rare", `${ui}/ad-ability-card.png`);
        this.mainLoader.add("ui-card-rare-bg", `${ui}/ad-ability-card-big.png`);
        this.mainLoader.add("ui-star-enabled", `${ui}/ability-star-enabled.png`);
        this.mainLoader.add("ui-star-disabled", `${ui}/ability-star-disabled.png`);

        // UI - skills
        this.mainLoader.add("ui-zombiecide", `${ui}/ui_zombiecide.png`);
        this.mainLoader.add("ui-reflux", `${ui}/ui_reflux.png`);
        this.mainLoader.add("ui-frankenzombie", `${ui}/ui_frankenzombie.png`);
        this.mainLoader.add("ui-spirit", `${ui}/ui_evil_spirit.png`);
        this.mainLoader.add("ui-fart", `${ui}/ui_deadly_fart.png`);
        this.mainLoader.add("ui-beholder", `${ui}/ui_beholder.png`);
        this.mainLoader.add("ui-bite", `${ui}/ui_abyss_bite.png`);
        this.mainLoader.add("ui-boomerang", `${sprites}/legmerang.png`);
        this.mainLoader.add("ui-pool", `${ui}/ui_acid_vomit.png`);

        // UI - Passive skills
        this.mainLoader.add("ui-speed", `${ui}/ui-speed.png`);
        this.mainLoader.add("ui-regeneration", `${ui}/ui-regeneration.png`);
        this.mainLoader.add("ui-max-health", `${ui}/ui-max-health.png`);
        this.mainLoader.add("ui-magnet", `${ui}/ui-magnet.png`);
        this.mainLoader.add("ui-health-restore", `${ui}/ui-health-restore.png`);

        // Config
        this.mainLoader.add("config", `${this.rootAssetsFolder}/config.json`);
    }
}
