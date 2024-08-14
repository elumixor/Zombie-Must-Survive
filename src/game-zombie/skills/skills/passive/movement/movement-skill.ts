import { circleTexture, type Actor } from "@core";
import { Player } from "game-zombie/actors";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";

export class MovementSkill extends Skill {
    readonly name = "Movement Increase";
    readonly description = "Increases movement speed";
    readonly texture = circleTexture({ radius: 50, color: "rgb(53, 185, 190)" });

    private readonly msAdded = this.addProperty(new NumProperty("Movement Speed Added", (level) => level));

    protected override update(actor: Actor, level: number) {
        assert(actor instanceof Player);

        const previous = level === 1 ? 0 : this.msAdded.value(level - 1);
        const current = this.msAdded.value(level);

        actor.speed += current - previous;
    }
}
