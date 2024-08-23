import { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BiteSpawnerComponent } from "./bite-spawner";
import { c, numProp } from "game-zombie/config";

@c
export class BiteSkill extends Skill {
    readonly name = "Bite of the Dead";
    readonly description = "From the ground rises a huge mouth that bites enemies";
    readonly texture = Texture.from("bite");

    @c(numProp()) private readonly damage = this.addProperty(new NumProperty("Damage"));
    @c(numProp()) private readonly radius = this.addProperty(new NumProperty("radius"));
    @c(numProp()) private readonly spawnCooldown = this.addProperty(new NumProperty("Spawn Cooldown"));

    private component?: BiteSpawnerComponent;

    protected override addToActor(actor: Actor) {
        this.component = new BiteSpawnerComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.radius = this.radius.value(level);
        this.component.spawnCooldown = this.spawnCooldown.value(level);

        this.component.updateParams();
    }
}
