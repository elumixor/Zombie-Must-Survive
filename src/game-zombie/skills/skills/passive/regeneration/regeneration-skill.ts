import { circleTexture, type Actor } from "@core";
import { Skill } from "../../../skill";
import { NumProperty } from "../../../skill-property";
import { RegenerationComponent } from "./regeneration-component";
import { c, numProp } from "game-zombie/config";

@c
export class RegenerationSkill extends Skill {
    readonly name = "Regeneration";
    readonly description = "Slowly restores some health over time";
    readonly texture = circleTexture({ radius: 50, color: "rgb(216, 55, 149)" });

    @c(numProp()) private readonly healthPercentRestored = this.addProperty(new NumProperty("Health Percent Restored"));

    private component?: RegenerationComponent;

    protected override addToActor(actor: Actor) {
        this.component = new RegenerationComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.healthPercentRestored = this.healthPercentRestored.value(level);
    }
}
