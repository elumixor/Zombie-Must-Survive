import { Actor } from "@core";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { PoolComponent } from "./pool-component";

@c
export class AcidPoolSkill extends Skill {
    readonly name = "Acid Pool";
    readonly description = "Acid pool that damages enemies inside it.";
    readonly texture = Texture.from("ui-pool");

    @cskill private readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill private readonly damageRate = this.addProperty(new NumProperty("Damage Rate"));
    @cskill private readonly radius = this.addProperty(new NumProperty("Radius"));
    @cskill private readonly range = this.addProperty(new NumProperty("Range"));
    @cskill private readonly lifetime = this.addProperty(new NumProperty("Lifetime"));
    @cskill private readonly spawnCooldown = this.addProperty(new NumProperty("Spawn Cooldown"));

    @c(c.num(), {
        section: "Skills",
        onUpdate([instance]) {
            const i = instance as AcidPoolSkill;
            i.update(i.actor!, i.level);
        },
    })
    private readonly travelDuration = 0.5;

    private component?: PoolComponent;

    protected override addToActor(actor: Actor) {
        this.component = new PoolComponent(actor);
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.damage = this.damage.value(level);
        this.component.damageRate = this.damageRate.value(level);
        this.component.lifetime = this.lifetime.value(level);
        this.component.radius = this.radius.value(level);
        this.component.spawnCooldown = this.spawnCooldown.value(level);
        this.component.range = this.range.value(level);
        this.component.travelDuration = this.travelDuration;

        this.component.updateParams();
    }
}
