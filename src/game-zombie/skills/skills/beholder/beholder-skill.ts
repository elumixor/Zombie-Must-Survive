import { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BeholderComponent } from "./beholder-component";

@c
export class BeholderSkill extends Skill {
    readonly name = "Eye of the beholder";
    readonly description =
        "Spawns an eye of the beholder that stands in one place and fires a ray towards a random enemy";
    readonly texture = Texture.from("beholder");

    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly fireCooldown = this.addProperty(new NumProperty("Fire Cooldown"));
    @cskill private readonly spawnCooldown = this.addProperty(new NumProperty("Spawn Cooldown"));
    @cskill private readonly maxInstances = this.addProperty(new NumProperty("Max Instances"));
    @cskill private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));

    private readonly fireDistance = 1000;

    private component?: BeholderComponent;

    protected override addToActor(actor: Actor) {
        this.component = new BeholderComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.damage = this.damage.value(level);
        this.component.fireCooldown = this.fireCooldown.value(level);
        this.component.spawnCooldown = this.spawnCooldown.value(level);
        this.component.maxInstances = this.maxInstances.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.fireDistance = this.fireDistance;

        this.component.updateParams();
    }
}
