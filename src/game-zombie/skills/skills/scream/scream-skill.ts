import { circleTexture, type Actor } from "@core";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { ScreamComponent } from "./scream-component";

export class ScreamSkill extends Skill {
    readonly name = "Banshee Scream";
    readonly description = "Creates a deadly sonic wave that freezes all enemies in place.";
    readonly texture = circleTexture({ radius: 50, color: "rgb(10, 162, 200)" });

    private readonly cooldown = this.addProperty(new NumProperty("Cooldown", (level) => 1 * 0.99 ** level));
    private readonly radius = this.addProperty(new NumProperty("Radius", (level) => 200 + 50 * level));
    private readonly speed = this.addProperty(new NumProperty("Speed", (level) => level * 200));

    private readonly freezeDuration = this.addProperty(new NumProperty("Freeze Duration", (level) => 2 + level * 0.5));

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
