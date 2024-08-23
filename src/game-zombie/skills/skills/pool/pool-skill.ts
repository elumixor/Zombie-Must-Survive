import { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { PoolSpawnerComponent } from "./pool-spawner";
import { c, numProp } from "game-zombie/config";

@c
export class PoolSkill extends Skill {
    readonly name = "Acid Pool";
    readonly description = "From the ground rises a huge mouth that bites enemies";
    readonly texture = Texture.from("pool");

    @c(numProp()) private readonly damage = this.addProperty(new NumProperty("Damage"));
    @c(numProp()) private readonly damageRate = this.addProperty(new NumProperty("Damage Rate"));
    @c(numProp()) private readonly radius = this.addProperty(new NumProperty("Radius"));
    @c(numProp()) private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));
    @c(numProp()) private readonly spawnCooldown = this.addProperty(new NumProperty("Spawn Cooldown"));

    private component?: PoolSpawnerComponent;

    protected override addToActor(actor: Actor) {
        this.component = new PoolSpawnerComponent(actor);
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.damageRate = this.damageRate.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.radius = this.radius.value(level);
        this.component.spawnCooldown = this.spawnCooldown.value(level);

        this.component.updateParams();
    }
}
