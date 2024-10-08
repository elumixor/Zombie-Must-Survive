import type { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { FrankenzombieComponent } from "./frankenzombie-component";

@c
export class FrankenzombieSkill extends Skill {
    override readonly name = "Frankenzombie";
    override readonly description = "Creates a chain lightning between enemies.";
    override readonly texture = Texture.from("ui-frankenzombie");

    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly cooldown = this.addProperty(new NumProperty("Cooldown"));
    @cskill private readonly distance = this.addProperty(new NumProperty("Radius"));
    @cskill private readonly numBounces = this.addProperty(new NumProperty("Bounces"));

    private component?: FrankenzombieComponent;

    protected override addToActor(actor: Actor) {
        this.component = new FrankenzombieComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.damage = this.damage.value(level);
        this.component.distance = this.distance.value(level);
        this.component.numBounces = this.numBounces.value(level);
        this.component.cooldown = this.cooldown.value(level);

        this.component.updateParams();
    }
}
