import { circleTexture, type Actor } from "@core";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";
import { GoldComponent } from "./gold-component";
import { c, numProp } from "game-zombie/config";

@c
export class GoldSkill extends Skill {
    readonly name = "Gold";
    readonly description = "Gives some gold over time";
    readonly texture = circleTexture({ radius: 50, color: "rgb(201, 161, 30)" });

    @c(numProp()) private readonly goldPerSecond = this.addProperty(new NumProperty("Gold Per Second"));

    private component?: GoldComponent;

    protected override addToActor(actor: Actor) {
        this.component = new GoldComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.goldPerSecond = this.goldPerSecond.value(level);
    }
}
