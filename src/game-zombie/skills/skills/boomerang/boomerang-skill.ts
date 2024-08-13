import type { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BoomerangComponent } from "./boomerang-component";

export class BoomerangSkill extends Skill {
    readonly name = "Boomerang";
    readonly description = "Throws a leg boomerang that damages enemies along its path.";
    readonly texture = Texture.from("boomerang");
    private readonly damage = this.addProperty(new NumProperty("Damage", (level) => 5 + level * 2));
    private readonly instances = this.addProperty(new NumProperty("Instances", (level) => floor(level / 2 + 2)));
    private readonly speed = this.addProperty(new NumProperty("Speed", (level) => 0.1 * level * 0.5));
    private readonly cooldown = this.addProperty(new NumProperty("Cooldown", (level) => 0.99 ** (level - 1)));
    private readonly lifetime = this.addProperty(new NumProperty("Lifetime", (level) => level * 1.5));
    private readonly radius = 300;

    private component?: BoomerangComponent;

    protected override addToActor(actor: Actor) {
        this.component = new BoomerangComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.radius = this.radius;
        this.component.speed = this.speed.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.cooldown = this.cooldown.value(level);
        this.component.damage = this.damage.value(level);
        this.component.instances = this.instances.value(level);

        this.component.updateParams();
    }
}
