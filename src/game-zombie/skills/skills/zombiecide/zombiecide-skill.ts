import { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { ZombiecideComponent } from "./zombiecide-component";

@c
export class ZombiecideSkill extends Skill {
    readonly name = "Zombiecide";
    readonly description = "Whenever enemy dies, it spawns a small zombie that attacks enemies.";
    readonly texture = Texture.from("ui-zombiecide");

    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));
    @cskill private readonly maxInstances = this.addProperty(new NumProperty("Maximum number of zombies"));

    private component?: ZombiecideComponent;

    protected override addToActor(actor: Actor) {
        this.component = new ZombiecideComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.maxInstances = this.maxInstances.value(level);
    }
}
