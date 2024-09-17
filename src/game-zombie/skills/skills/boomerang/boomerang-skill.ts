import type { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BoomerangComponent } from "./boomerang-component";

@c
export class BoomerangSkill extends Skill {
    readonly name = "Boomerang";
    readonly description = "Throws a leg boomerang that damages enemies along its path.";
    readonly texture = Texture.from("boomerang");
    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly instances = this.addProperty(new NumProperty("Instances"));
    @cskill private readonly speed = this.addProperty(new NumProperty("Speed"));
    @cskill private readonly cooldown = this.addProperty(new NumProperty("Cooldown"));
    @cskill private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));
    private readonly radius = 300;

    private component?: BoomerangComponent;

    protected override addToActor(actor: Actor) {
        this.component = new BoomerangComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
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
