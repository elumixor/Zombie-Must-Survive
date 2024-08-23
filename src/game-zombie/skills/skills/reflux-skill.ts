import type { Actor } from "@core";
import { ProjectileWeaponComponent } from "game-zombie/components";
import { Texture } from "pixi.js";
import { Skill } from "../skill";
import { NumProperty } from "../skill-property";
import { c, numProp } from "game-zombie/config";

@c
export class RefluxSkill extends Skill {
    readonly name = "Reflux";
    readonly description = "Spit toxic projectiles at enemies.";
    readonly texture = Texture.from("reflux");

    private readonly numProjectiles = this.addProperty(new NumProperty("Projectiles", [1]));

    @c(numProp()) private readonly damage = this.addProperty(new NumProperty("Damage", [1]));
    @c(numProp()) private readonly cooldown = this.addProperty(new NumProperty("Cooldown", [0.5]));
    @c(numProp()) private readonly pierce = this.addProperty(new NumProperty("Pierce", [0], { hideZero: true }));

    private readonly distance = 500;
    private readonly projectileTexture = Texture.from("spit");

    private component?: ProjectileWeaponComponent;

    protected override addToActor(actor: Actor) {
        this.component = new ProjectileWeaponComponent(actor);
        this.component.tags.add("enemy");
        actor.addComponent(this.component);
    }

    protected override update(_actor: Actor, level: number) {
        assert(this.component);

        this.component.numProjectiles = this.numProjectiles.value(level);
        this.component.spread = this.component.numProjectiles * 10;
        this.component.cooldown = this.cooldown.value(level);

        this.component.projectileConfig.texture = this.projectileTexture;
        this.component.projectileConfig.distance = this.distance;
        this.component.projectileConfig.alignToDirection = true;
        this.component.projectileConfig.damage = this.damage.value(level);
        this.component.projectileConfig.pierce = this.pierce.value(level);
    }
}
