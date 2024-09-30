import { circleTexture, type Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";
import { GoldComponent } from "./gold-component";

@c
export class GoldSkill extends Skill {
    override readonly name = "Gold";
    override readonly description = "Gives some gold over time";
    override readonly texture = circleTexture({ radius: 50, color: "rgb(201, 161, 30)" });

    @cskill private readonly goldPerSecond = this.addProperty(new NumProperty("Gold Per Second"));

    private component?: GoldComponent;

    protected override addToActor(actor: Actor) {
        this.component = new GoldComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.goldPerSecond = this.goldPerSecond.value(level);
    }
}
