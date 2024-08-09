import { circleTexture, type Actor } from "@core";
import { ProjectileWeaponComponent } from "game-zombie/components";
import { Skill } from "../skill";
import { NumProperty } from "../skill-property";

export class ScreamSkill extends Skill {
    readonly name = "Banshee Scream";
    readonly description = "Creates a deadly sonic wave that damages all enemies around the player";
    readonly texture = circleTexture({ radius: 50, color: "rgb(200, 10, 150)" });

    private readonly numProjectiles = this.addProperty(
        new NumProperty("Projectiles", (level) => clamp(round(level * 0.5 + (level >= 2 ? 1 : 0)), 1, 5)),
    );

    private readonly damage = this.addProperty(new NumProperty("Damage", (level) => 5 + (level - 1) * 2));
    private readonly cooldown = this.addProperty(new NumProperty("Cooldown", (level) => 0.5 * 0.99 ** level));
    private readonly pierce = this.addProperty(
        new NumProperty("Pierce", (level) => clamp(floor(level - 1), 0, 5), { hideZero: true }),
    );

    private readonly distance = 500;

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

        this.component.projectileConfig.texture = this.texture;
        this.component.projectileConfig.distance = this.distance;
        this.component.projectileConfig.alignToDirection = true;
        this.component.projectileConfig.damage = this.damage.value(level);
        this.component.projectileConfig.pierce = this.pierce.value(level);
    }
}