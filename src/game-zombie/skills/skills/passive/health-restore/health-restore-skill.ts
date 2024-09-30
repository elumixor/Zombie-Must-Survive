import type { Actor } from "@core";
import { Player } from "game-zombie/actors";
import { c } from "game-zombie/config";
import { Texture } from "pixi.js";
import { Skill } from "../../../skill";

@c
export class HealthRestoreSkill extends Skill {
    override readonly name = "Health Restore";
    override readonly description = "Restore all health once";
    override readonly texture = Texture.from("ui-health-restore");

    override update(actor: Actor, level: number) {
        super.update(actor, level);

        assert(actor instanceof Player, "Health Restore skill can only be applied to the player");

        actor.health.heal(actor.health.maxHealth);
    }
}
