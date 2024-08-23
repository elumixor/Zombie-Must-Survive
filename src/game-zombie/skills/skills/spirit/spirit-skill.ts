import type { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { SpiritComponent } from "./spirit-component";
import { c, numProp } from "game-zombie/config";

@c
export class SpiritSkill extends Skill {
    readonly name = "Angry Spirit";
    readonly description = "Creates angry spirits from dead enemies with some chance.";
    readonly texture = Texture.from("spirit");

    @c(numProp()) private readonly numSpirits = this.addProperty(new NumProperty("Number of spirits"));
    @c(numProp()) private readonly damage = this.addProperty(new NumProperty("Damage"));
    @c(numProp()) private readonly chance = this.addProperty(new NumProperty("Chance"));
    @c(numProp()) private readonly speed = this.addProperty(new NumProperty("Speed"));

    private component?: SpiritComponent;

    protected override addToActor(actor: Actor) {
        this.component = new SpiritComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.numSpirits = this.numSpirits.value(level);
        this.component.damage = this.damage.value(level);
        this.component.chance = this.chance.value(level);
        this.component.speed = this.speed.value(level);
    }
}
