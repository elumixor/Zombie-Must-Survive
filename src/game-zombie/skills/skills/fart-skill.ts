import { Actor } from "@core";
import { AuraWeaponComponent } from "game-zombie/components";
import { Skill } from "../skill";
import { NumProperty } from "../skill-property";
import { Texture } from "pixi.js";
import { c, numProp } from "game-zombie/config";

@c
export class FartSkill extends Skill {
    readonly name = "Stinky Aura";
    readonly description = "Releases a stinky cloud that damages enemies.";
    readonly texture = Texture.from("fart");

    @c(numProp()) protected readonly damage = this.addProperty(new NumProperty("Damage"));
    @c(numProp()) protected readonly radius = this.addProperty(new NumProperty("Radius"));
    @c(numProp()) protected readonly cooldown = this.addProperty(new NumProperty("Cooldown"));

    private component?: AuraWeaponComponent;

    protected override addToActor(actor: Actor) {
        this.component = new AuraWeaponComponent(actor);
        this.component.tags.add("enemy");
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.damage = this.damage.value(level);
        this.component.radius = this.radius.value(level);
        this.component.cooldown = this.cooldown.value(level);
    }
}
