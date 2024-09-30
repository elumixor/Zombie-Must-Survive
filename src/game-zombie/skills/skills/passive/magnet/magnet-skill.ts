import type { Actor } from "@core";
import { Player } from "game-zombie/actors";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";

@c
export class MagnetSkill extends Skill {
    override readonly name = "Magnet";
    override readonly description = "Increases the range of XP crystals pick up";
    override readonly texture = Texture.from("ui-magnet");

    @cskill private readonly extraRadius = this.addProperty(new NumProperty("Extra Radius"));

    private currentIncrease = 0;
    protected override removeFromActor(actor: Actor) {
        super.removeFromActor(actor);
        assert(actor instanceof Player);
        actor.pickupCollider.radius -= this.currentIncrease;
        this.currentIncrease = 0;
    }

    override update(actor: Actor, level: number) {
        assert(actor instanceof Player);
        if (level === 0) return;

        const previous = this.currentIncrease;
        const current = this.extraRadius.value(level);
        const diff = current - previous;
        this.currentIncrease = current;

        actor.pickupCollider.radius += diff;
    }
}
