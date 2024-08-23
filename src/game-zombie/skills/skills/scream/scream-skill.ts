import { circleTexture, type Actor } from "@core";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { ScreamComponent } from "./scream-component";
import { c, numProp } from "game-zombie/config";

@c
export class ScreamSkill extends Skill {
    readonly name = "Banshee Scream";
    readonly description = "Creates a deadly sonic wave that freezes all enemies in place.";
    readonly texture = circleTexture({ radius: 50, color: "rgb(10, 162, 200)" });

    @c(numProp()) private readonly cooldown = this.addProperty(new NumProperty("Cooldown"));
    @c(numProp()) private readonly radius = this.addProperty(new NumProperty("Radius"));
    @c(numProp()) private readonly speed = this.addProperty(new NumProperty("Speed"));
    @c(numProp()) private readonly freezeDuration = this.addProperty(new NumProperty("Freeze Duration"));

    private component?: ScreamComponent;

    protected override addToActor(actor: Actor) {
        this.component = new ScreamComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.radius = this.radius.value(level);
        this.component.freezeDuration = this.freezeDuration.value(level);
        this.component.cooldown = this.cooldown.value(level);
        this.component.speed = this.speed.value(level);

        this.component.updateParams();
    }
}
