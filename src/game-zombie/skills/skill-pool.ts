import { Skill } from "./skill";
import {
    AcidPoolSkill,
    BeholderSkill,
    BiteSkill,
    BoomerangSkill,
    FartSkill,
    FrankenzombieSkill,
    GoldSkill,
    MagnetSkill,
    MaxHpSkill,
    MovementSkill,
    RefluxSkill,
    RegenerationSkill,
    ScreamSkill,
    SpiritSkill,
    ZombiecideSkill,
} from "./skills";

export class SkillPool {
    readonly reflux = new RefluxSkill();
    readonly fart = new FartSkill();
    readonly boomerang = new BoomerangSkill();
    readonly acidPool = new AcidPoolSkill();
    readonly frankenzombie = new FrankenzombieSkill();
    readonly spirit = new SpiritSkill();
    readonly scream = new ScreamSkill();
    readonly zombiecide = new ZombiecideSkill();
    readonly bite = new BiteSkill();
    readonly beholder = new BeholderSkill();

    /* Passive skills */

    readonly gold = new GoldSkill();
    readonly magnet = new MagnetSkill();
    readonly maxHp = new MaxHpSkill();
    readonly movement = new MovementSkill();
    readonly regeneration = new RegenerationSkill();

    readonly allSkills = new Set<Skill>([
        this.reflux,
        this.fart,
        this.boomerang,
        this.acidPool,
        this.frankenzombie,
        this.spirit,
        this.scream,
        this.zombiecide,
        this.bite,
        this.beholder,

        /* Passive skills */

        this.gold,
        this.magnet,
        this.maxHp,
        this.movement,
        this.regeneration,
    ]);

    readonly maxSkillsOnLevelUp = 4;

    /** Pick `n` skills of a given rarity that are not already learned completely by the target character */
    getSkills() {
        const numSkills = min(this.maxSkillsOnLevelUp, this.allSkills.size);
        return [...this.allSkills].pick(numSkills, { repeat: false });
    }
}
