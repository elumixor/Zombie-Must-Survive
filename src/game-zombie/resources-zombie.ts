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

    @spine("enemies/butcher/butcher")
    declare readonly butcher: EnemySpine;

    @spine("enemies/nun/nun")
    declare readonly nun: EnemySpine;

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

    @spine("abilities/zombiecide/zombiecide")
    declare readonly zombiecide: EnemySpine;

    /* Other */

    @spine("brain/brain")
    declare readonly brain: Spine<"appear" | "idle">;

    @spine("fireball-pink/fireball-pink")
    declare readonly fireball: Spine<"idle">;

    @spine("enemies/enemy-death/enemy-death")
    declare readonly enemyDeath: Spine<"death">;

    constructor() {
        super("resources/assets", "resources/html");

        const sprites = this.pathTo("sprites");

        // Environment and pickups
        this.mainLoader.add("background", `${sprites}/background.png`);

        // Weapons, abilities, and particles
        this.mainLoader.add("lightning", `${sprites}/frankenzombie.png`);
        this.mainLoader.add("spit", `${sprites}/reflux.png`);
        this.mainLoader.add("boomerang", `${sprites}/legmerang.png`);
        this.mainLoader.add("acid-pool-projectile", `${sprites}/slime.png`);

        const ui = `${sprites}/ui`;

        // UI - General
        this.mainLoader.add("ui-card", `${ui}/ui-ability-card.png`);
        this.mainLoader.add("ui-card-rare", `${ui}/ui-ability-card-reward.png`);
        this.mainLoader.add("ui-star-enabled", `${ui}/ability-star-enabled.png`);
        this.mainLoader.add("ui-star-disabled", `${ui}/ability-star-disabled.png`);
        this.mainLoader.add("ui-level-up-background", `${ui}/ui-level-up.png`);
        this.mainLoader.add("ui-game-over", `${ui}/ui-dead.png`);
        this.mainLoader.add("ui-die", `${ui}/ui-button-die.png`);
        this.mainLoader.add("ui-revive", `${ui}/ui-button-continue.png`);

        // UI - skills
        this.mainLoader.add("ui-zombiecide", `${ui}/ui-zombiecide.png`);
        this.mainLoader.add("ui-reflux", `${ui}/ui-reflux.png`);
        this.mainLoader.add("ui-frankenzombie", `${ui}/ui-frankenzombie.png`);
        this.mainLoader.add("ui-spirit", `${ui}/ui-evil-spirit.png`);
        this.mainLoader.add("ui-fart", `${ui}/ui-deadly-fart.png`);
        this.mainLoader.add("ui-beholder", `${ui}/ui-beholder.png`);
        this.mainLoader.add("ui-bite", `${ui}/ui-abyss-bite.png`);
        this.mainLoader.add("ui-boomerang", `${sprites}/legmerang.png`);
        this.mainLoader.add("ui-pool", `${ui}/ui-acid-vomit.png`);
        this.mainLoader.add("ui-scream", `${ui}/ui-banshee-scream.png`);

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

export type EnemySpineKey = "villager1" | "villager2" | "villager3" | "butcher" | "nun";
