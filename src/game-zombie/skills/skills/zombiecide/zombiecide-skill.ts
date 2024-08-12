import { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { ZombiecideComponent } from "./zombiecide-component";

export class ZombiecideSkill extends Skill {
    readonly name = "Zombiecide";
    readonly description = "Whenever enemy dies, it spawns a small zombie that attacks enemies.";
    readonly texture = Texture.from("zombiecide");

    private readonly damage = this.addProperty(new NumProperty("Damage", (level) => 5 + (level - 1) * 2));
    private readonly lifetime = this.addProperty(new NumProperty("Lifetime", (level) => 5 * level));
    private readonly maxInstances = this.addProperty(new NumProperty("Maximum number of zombies", (level) => level));

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
