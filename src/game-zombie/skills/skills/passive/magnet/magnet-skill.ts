import { circleTexture, type Actor } from "@core";
import { Player } from "game-zombie/actors";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";

@c
export class MagnetSkill extends Skill {
    readonly name = "Magnet";
    readonly description = "Increases the range of XP crystals pick up";
    readonly texture = circleTexture({ radius: 50, color: "rgb(93, 131, 5)" });

    @cskill private readonly extraRadius = this.addProperty(new NumProperty("Extra Radius"));

    override update(actor: Actor, level: number) {
        assert(actor instanceof Player);

        const previous = level === 1 ? 0 : this.extraRadius.value(level - 1);
        const current = this.extraRadius.value(level);
        actor.pickupCollider.radius += current - previous;
    }
}
