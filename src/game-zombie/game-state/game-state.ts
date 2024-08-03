import { injectable } from "@core";
import { SkillPool } from "game-zombie/skills";
import { PlayerState } from "./player-state";

@injectable
export class GameState {
    readonly skillPool = new SkillPool();
    readonly player = new PlayerState();

    constructor() {
        for (const skill of this.skillPool.defaultSkills) {
            skill.level++;
            this.player.skills.add(skill);
        }
    }
}
