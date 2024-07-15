import { injectable } from "@core/di";
import type { ISkilled, Skill, SkillRarity } from "./skill";
import { AuraSkill, ShurikenSkill } from "./skills";
import type { ICircleContainer } from "game/circle-container";

@injectable
export class SkillPool {
    readonly auraSkill = new AuraSkill();

    private readonly skills: readonly Skill[] = [this.auraSkill, new ShurikenSkill()];

    /**
     * Pick `n` skills of a given rarity that are not already learned completely by the target character
     */
    pick(n: number, target: ISkilled, rarity: SkillRarity) {
        const omit = new Set(target.skills.filter((skill) => skill.level === skill.maxLevel));
        const skills = this.skills.filter((skill) => skill.rarity === rarity && !omit.has(skill));
        return skills.pick(Math.min(skills.length, n), { repeat: false });
    }

    getOptions(target: ISkilled) {
        return [...this.pick(2, target, "common"), ...this.pick(1, target, "rare")];
    }

    reset() {
        for (const skill of this.skills) skill.reset();
    }

    learn(skill: Skill, target: ISkilled & ICircleContainer) {
        if (target.skills.includes(skill)) skill.level++;
        else skill.applyTo(target);
    }
}
