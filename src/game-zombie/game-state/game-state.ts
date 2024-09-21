import { di } from "@elumixor/di";
import { Skill, SkillPool } from "game-zombie/skills";
import { PlayerState } from "./player-state";
import { c } from "game-zombie/config";

@di.injectable
export class GameState {
    readonly skillPool = new SkillPool();
    readonly player = new PlayerState();

    readonly defaultSkills = new Set<Skill>([this.skillPool.reflux]);

    constructor() {
        // Add all skills
        for (const skill of this.skillPool.allSkills) this.player.skills.add(skill);

        // Set initial level
        for (const skill of this.defaultSkills) skill.level = 1;
    }

    destroy() {
        c.unsubscribe(this.player);
    }
}
