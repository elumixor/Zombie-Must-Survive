import { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { PoolSpawnerComponent } from "./pool-spawner";

@c
export class PoolSkill extends Skill {
    readonly name = "Acid Pool";
    readonly description = "From the ground rises a huge mouth that bites enemies";
    readonly texture = Texture.from("pool");

    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly damageRate = this.addProperty(new NumProperty("Damage Rate"));
    @cskill private readonly radius = this.addProperty(new NumProperty("Radius"));
    @cskill private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));
    @cskill private readonly spawnCooldown = this.addProperty(new NumProperty("Spawn Cooldown"));

    private component?: PoolSpawnerComponent;

    protected override addToActor(actor: Actor) {
        this.component = new PoolSpawnerComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.damageRate = this.damageRate.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.radius = this.radius.value(level);
        this.component.spawnCooldown = this.spawnCooldown.value(level);

        this.component.updateParams();
    }
}
