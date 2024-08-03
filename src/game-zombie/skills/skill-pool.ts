import { Skill } from "./skill";
import { AuraSkill } from "./skills";
import { ShurikenSkill } from "./skills/shuriken-skill";

export class SkillPool {
    readonly defaultSkills = new Set<Skill>([new AuraSkill()]);
    readonly allSkills = new Set<Skill>([new ShurikenSkill(), ...this.defaultSkills]);

    readonly maxSkillsOnLevelUp = 4;

    /** Pick `n` skills of a given rarity that are not already learned completely by the target character */
    getSkills() {
        const numSkills = min(this.maxSkillsOnLevelUp, this.allSkills.size);
        return [...this.allSkills].pick(numSkills, { repeat: false });
    }
}
