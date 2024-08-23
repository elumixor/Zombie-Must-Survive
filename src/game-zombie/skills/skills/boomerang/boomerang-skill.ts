import type { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BoomerangComponent } from "./boomerang-component";
import { c, numProp } from "game-zombie/config";

@c
export class BoomerangSkill extends Skill {
    readonly name = "Boomerang";
    readonly description = "Throws a leg boomerang that damages enemies along its path.";
    readonly texture = Texture.from("boomerang");
    @c(numProp()) private readonly damage = this.addProperty(new NumProperty("Damage"));
    @c(numProp()) private readonly instances = this.addProperty(new NumProperty("Instances"));
    @c(numProp()) private readonly speed = this.addProperty(new NumProperty("Speed"));
    @c(numProp()) private readonly cooldown = this.addProperty(new NumProperty("Cooldown"));
    @c(numProp()) private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));
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
