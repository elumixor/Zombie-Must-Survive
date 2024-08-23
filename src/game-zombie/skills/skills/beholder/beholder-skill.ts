import { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { BeholderSpawnerComponent } from "./beholder-spawner";
import { c, numProp } from "game-zombie/config";

@c
export class BeholderSkill extends Skill {
    readonly name = "Eye of the beholder";
    readonly description =
        "Spawns an eye of the beholder that stands in one place and fires a ray towards a random enemy";
    readonly texture = Texture.from("beholder");

    @c(numProp()) private readonly damage = this.addProperty(new NumProperty("Damage"));
    @c(numProp()) private readonly fireCooldown = this.addProperty(new NumProperty("Fire Cooldown"));
    @c(numProp()) private readonly spawnCooldown = this.addProperty(new NumProperty("Spawn Cooldown"));
    @c(numProp()) private readonly maxInstances = this.addProperty(new NumProperty("Max Instances"));
    @c(numProp()) private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));

    private readonly fireDistance = 1000;

    private component?: BeholderSpawnerComponent;

    protected override addToActor(actor: Actor) {
        this.component = new BeholderSpawnerComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.fireCooldown = this.fireCooldown.value(level);
        this.component.spawnCooldown = this.spawnCooldown.value(level);
        this.component.maxInstances = this.maxInstances.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.fireDistance = this.fireDistance;

        this.component.updateParams();
    }
}
