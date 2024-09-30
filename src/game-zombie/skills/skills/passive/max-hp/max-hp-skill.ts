import type { Actor } from "@core";
import { Player } from "game-zombie/actors";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";

@c
export class MaxHpSkill extends Skill {
    override readonly name = "Max HP";
    override readonly description = "Increases max HP";
    override readonly texture = Texture.from("ui-max-health");

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
