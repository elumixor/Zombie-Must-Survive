import { di } from "@elumixor/di";
import { Skill, SkillPool } from "game-zombie/skills";
import { PlayerState } from "./player-state";

@di.injectable
export class GameState {
    readonly skillPool = new SkillPool();
    readonly player = new PlayerState();

    // readonly defaultSkills = new Set<Skill>([this.skillPool.fart, this.skillPool.reflux]);
    readonly defaultSkills = new Set<Skill>([this.skillPool.scream]);

    constructor() {
        for (const skill of this.defaultSkills) {
            skill.level++;
            this.player.skills.add(skill);
        }
    }
}
