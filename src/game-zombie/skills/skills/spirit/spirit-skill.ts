import type { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { SpiritComponent } from "./spirit-component";

@c
export class SpiritSkill extends Skill {
    readonly name = "Angry Spirit";
    readonly description = "Creates angry spirits from dead enemies with some chance.";
    readonly texture = Texture.from("ui-spirit");

    @cskill private readonly numSpirits = this.addProperty(new NumProperty("Number of spirits"));
    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly chance = this.addProperty(new NumProperty("Chance"));
    @cskill private readonly speed = this.addProperty(new NumProperty("Speed"));

    private component?: SpiritComponent;

    protected override addToActor(actor: Actor) {
        this.component = new SpiritComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.numSpirits = this.numSpirits.value(level);
        this.component.damage = this.damage.value(level);
        this.component.chance = this.chance.value(level);
        this.component.speed = this.speed.value(level);
    }
}
