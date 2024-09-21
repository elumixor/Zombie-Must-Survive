import type { Actor } from "@core";
import { ProjectileWeaponComponent } from "game-zombie/components";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";

@c
export class RefluxSkill extends Skill {
    readonly name = "Reflux";
    readonly description = "Spit toxic projectiles at enemies.";
    readonly texture = Texture.from("ui-reflux");

    @cskill private readonly numProjectiles = this.addProperty(new NumProperty("Projectiles", [1]));
    @cskill private readonly damage = this.addProperty(new NumProperty("Damage", [1]));
    @cskill private readonly cooldown = this.addProperty(new NumProperty("Cooldown", [0.5]));

    @c(c.num(), { section: "Skills" })
    private readonly distance = 500;

    @c(c.num(), { section: "Skills" })
    private readonly speed = 10;

    private readonly projectileTexture = Texture.from("spit");

    private component?: ProjectileWeaponComponent;

    protected override addToActor(actor: Actor) {
        this.component = new ProjectileWeaponComponent(actor);
        this.component.tags.add("enemy");
        actor.addComponent(this.component);
    }

    protected override removeFromActor() {
        this.component?.destroy();
        this.component = undefined;
    }

    override update(_actor: Actor, level: number) {
        if (!this.component) return;

        this.component.numProjectiles = this.numProjectiles.value(level);
        this.component.spread = this.component.numProjectiles * 10;
        this.component.cooldown = this.cooldown.value(level);

        this.component.projectileConfig.texture = this.projectileTexture;
        this.component.projectileConfig.distance = this.distance;
        this.component.projectileConfig.alignToDirection = true;
        this.component.projectileConfig.damage = this.damage.value(level);
        this.component.projectileConfig.movement.maxSpeed = this.speed;
        this.component.projectileConfig.movement.minSpeed = this.speed;
    }
}
