import { c } from "game-zombie/config";
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

        // this.gold, // on the prototype stage we don't need it
        // this.magnet,
        // this.maxHp,
        // this.movement,
        // this.regeneration,
    ]);

    readonly rareSkills = new Set<Skill>([this.fart, this.bite, this.zombiecide]);
    readonly ignoredSkills = new Map<number, Set<Skill>>([
        [2, new Set<Skill>([this.reflux, this.acidPool, this.scream, this.zombiecide, this.beholder, this.spirit])],
    ]);
    readonly normalSkills = this.allSkills.difference(this.rareSkills);

    readonly maxSkillsOnLevelUp = 3;

    /** Pick `n` skills of a given rarity that are not already learned completely by the target character */
    getSkills(level: number) {
        const numSkills = min(this.maxSkillsOnLevelUp, this.allSkills.size);
        const ignored = this.ignoredSkills.get(level) ?? new Set<Skill>();

        const normalSkills = [...this.normalSkills.difference(ignored)].pick(max(0, numSkills - 1), { repeat: false });
        const rareSkills = [...this.rareSkills.difference(ignored)].pick(max(0, numSkills - normalSkills.length), {
            repeat: false,
        });

        return [...normalSkills, ...rareSkills];
    }

    destroy() {
        for (const skill of this.allSkills) c.unsubscribe(skill);
    }
}
