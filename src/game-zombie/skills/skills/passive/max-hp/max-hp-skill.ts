import { circleTexture, type Actor } from "@core";
import { Player } from "game-zombie/actors";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";

@c
export class MaxHpSkill extends Skill {
    readonly name = "Max HP";
    readonly description = "Increases max HP";
    readonly texture = circleTexture({ radius: 50, color: "rgb(147, 53, 190)" });

    @cskill private readonly hpAdded = this.addProperty(new NumProperty("HP Added"));

    protected override removeFromActor(actor: Actor) {
        super.removeFromActor(actor);
        assert(actor instanceof Player);
        actor.bonusHealth = 0;
    }
    override update(actor: Actor, level: number) {
        if (level === 0) return;

        assert(actor instanceof Player);
        actor.bonusHealth = this.hpAdded.value(level);
    }
}
