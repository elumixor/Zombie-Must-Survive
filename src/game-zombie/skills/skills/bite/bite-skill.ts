import { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BiteSpawnerComponent } from "./bite-spawner";

export class BiteSkill extends Skill {
    readonly name = "Bite of the Dead";
    readonly description = "From the ground rises a huge mouth that bites enemies";
    readonly texture = Texture.from("bite");

    private readonly damage = this.addProperty(new NumProperty("Damage", (level) => 10 + (level - 1) * 2));
    private readonly radius = this.addProperty(new NumProperty("radius", (level) => 100 + (level - 1) * 10));
    private readonly spawnCooldown = this.addProperty(
        new NumProperty("Spawn Cooldown", (level) => 2 * 0.98 ** (level - 1)),
    );

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
