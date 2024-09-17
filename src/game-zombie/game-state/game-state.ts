import { di } from "@elumixor/di";
import { Skill, SkillPool } from "game-zombie/skills";
import { PlayerState } from "./player-state";

@di.injectable
export class GameState {
    readonly skillPool = new SkillPool();
    readonly player = new PlayerState();

    readonly defaultSkills = new Set<Skill>([this.skillPool.reflux]);

    constructor() {
        // Add all skills
        for (const skill of this.skillPool.allSkills) this.player.skills.add(skill);

        // Set 1st level (make active)
        for (const skill of this.defaultSkills) skill.level++;
    }
}
