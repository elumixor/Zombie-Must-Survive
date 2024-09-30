import { circleTexture, type Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { ScreamComponent } from "./scream-component";

@c
export class ScreamSkill extends Skill {
    override readonly name = "Banshee Scream";
    override readonly description = "Creates a deadly sonic wave that freezes all enemies in place.";
    override readonly texture = circleTexture({ radius: 50, color: "rgb(10, 162, 200)" });

    @cskill private readonly cooldown = this.addProperty(new NumProperty("Cooldown"));
    @cskill private readonly radius = this.addProperty(new NumProperty("Radius"));
    @cskill private readonly growSpeed = this.addProperty(new NumProperty("Speed"));
    @cskill private readonly freezeDuration = this.addProperty(new NumProperty("Freeze Duration"));

    private component?: ScreamComponent;

    protected override addToActor(actor: Actor) {
        this.component = new ScreamComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.radius = this.radius.value(level);
        this.component.freezeDuration = this.freezeDuration.value(level);
        this.component.cooldown = this.cooldown.value(level);
        this.component.growSpeed = this.growSpeed.value(level);

        this.component.updateParams();
    }
}
