import { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BiteSpawnerComponent } from "./bite-spawner";

@c
export class BiteSkill extends Skill {
    override readonly name = "Bite of the Dead";
    override readonly description = "From the ground rises a huge mouth that bites enemies";
    override readonly texture = Texture.from("ui-bite");

    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly radius = this.addProperty(new NumProperty("radius"));
    @cskill private readonly spawnCooldown = this.addProperty(new NumProperty("Spawn Cooldown"));

    private component?: BiteSpawnerComponent;

    protected override addToActor(actor: Actor) {
        this.component = new BiteSpawnerComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.damage = this.damage.value(level);
        this.component.radius = this.radius.value(level);
        this.component.spawnCooldown = this.spawnCooldown.value(level);

        this.component.updateParams();
    }
}
