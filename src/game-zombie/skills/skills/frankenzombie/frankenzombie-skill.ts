import type { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { FrankenzombieComponent } from "./frankenzombie-component";

export class FrankenzombieSkill extends Skill {
    readonly name = "Frankenzombie";
    readonly description = "Creates a chain lightning between enemies.";
    readonly texture = Texture.from("lightning");

    private readonly damage = this.addProperty(new NumProperty("Damage", (level) => 5 + (level - 1) * 2));
    private readonly cooldown = this.addProperty(new NumProperty("Cooldown", (level) => 1 * 0.99 ** level));
    private readonly radius = this.addProperty(new NumProperty("Radius", (level) => 200 + level * 30));
    private readonly numBounces = this.addProperty(new NumProperty("Bounces", (level) => 3 + level));

    private component?: FrankenzombieComponent;

    protected override addToActor(actor: Actor) {
        this.component = new FrankenzombieComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.radius = this.radius.value(level);
        this.component.numBounces = this.numBounces.value(level);
        this.component.cooldown = this.cooldown.value(level);

        this.component.updateParams();
    }
}