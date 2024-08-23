import { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { ZombiecideComponent } from "./zombiecide-component";
import { c, numProp } from "game-zombie/config";

@c
export class ZombiecideSkill extends Skill {
    readonly name = "Zombiecide";
    readonly description = "Whenever enemy dies, it spawns a small zombie that attacks enemies.";
    readonly texture = Texture.from("zombiecide");

    @c(numProp()) private readonly damage = this.addProperty(new NumProperty("Damage"));
    @c(numProp()) private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));
    @c(numProp()) private readonly maxInstances = this.addProperty(new NumProperty("Maximum number of zombies"));

    private component?: ZombiecideComponent;

    protected override addToActor(actor: Actor) {
        this.component = new ZombiecideComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.maxInstances = this.maxInstances.value(level);
    }
}
