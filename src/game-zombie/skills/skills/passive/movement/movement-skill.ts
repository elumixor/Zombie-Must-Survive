import { circleTexture, type Actor } from "@core";
import { Player } from "game-zombie/actors";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";

@c
export class MovementSkill extends Skill {
    readonly name = "Movement Increase";
    readonly description = "Increases movement speed";
    readonly texture = circleTexture({ radius: 50, color: "rgb(53, 185, 190)" });

    @cskill private readonly msAdded = this.addProperty(new NumProperty("Movement Speed Added"));

    private currentIncrease = 0;
    protected override removeFromActor(actor: Actor) {
        assert(actor instanceof Player);
        actor.speed -= this.currentIncrease;
        this.currentIncrease = 0;
    }

    override update(actor: Actor, level: number) {
        assert(actor instanceof Player);

        if (level === 0) return;

        const previous = this.currentIncrease;
        const current = this.msAdded.value(level);
        const diff = current - previous;
        this.currentIncrease = current;

        actor.speed += diff;
    }
}
