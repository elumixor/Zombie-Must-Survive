import { Actor } from "@core";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { PoolSpawnerComponent } from "./pool-spawner";

export class PoolSkill extends Skill {
    readonly name = "Acid Pool";
    readonly description = "From the ground rises a huge mouth that bites enemies";
    readonly texture = Texture.from("pool");

    private readonly damage = this.addProperty(new NumProperty("Damage", (level) => 10 + (level - 1) * 2));
    private readonly damageRate = this.addProperty(new NumProperty("Damage Rate", (level) => 0.95 ** (level - 1)));
    private readonly radius = this.addProperty(new NumProperty("Radius", (level) => 100 + (level - 1) * 10));
    private readonly lifetime = this.addProperty(new NumProperty("Lifetime", (level) => 1 + (level - 1) / 2));
    private readonly spawnCooldown = this.addProperty(
        new NumProperty("Spawn Cooldown", (level) => 2 * 0.98 ** (level - 1)),
    );

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
