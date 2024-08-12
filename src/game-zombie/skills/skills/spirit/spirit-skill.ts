import type { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { SpiritComponent } from "./spirit-component";

export class SpiritSkill extends Skill {
    readonly name = "Angry Spirit";
    readonly description = "Creates angry spirits from dead enemies with some chance.";
    readonly texture = Texture.from("spirit");

    private readonly numSpirits = this.addProperty(new NumProperty("Number of spirits", (level) => level));
    private readonly damage = this.addProperty(new NumProperty("Damage", (level) => 5 + (level - 1) * 2));
    private readonly chance = this.addProperty(new NumProperty("Chance", (level) => 0.5 * 1.1 ** level));
    private readonly speed = this.addProperty(new NumProperty("Speed", (level) => 10 + level));

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
