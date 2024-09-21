import { Actor } from "@core";
import { AuraWeaponComponent } from "game-zombie/components";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";

@c
export class FartSkill extends Skill {
    readonly name = "Stinky Aura";
    readonly description = "Releases a stinky cloud that damages enemies.";
    readonly texture = Texture.from("ui-fart");

    @cskill protected readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill protected readonly radius = this.addProperty(new NumProperty("Radius"));
    @cskill protected readonly cooldown = this.addProperty(new NumProperty("Cooldown"));

    private component?: AuraWeaponComponent;

    protected override addToActor(actor: Actor) {
        this.component = new AuraWeaponComponent(actor);
        this.component.tags.add("enemy");
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
        this.component.cooldown = this.cooldown.value(level);
    }
}
