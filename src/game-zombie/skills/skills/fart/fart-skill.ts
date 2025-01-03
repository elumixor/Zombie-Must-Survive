import { Actor } from "@core";
import { AuraWeaponComponent } from "game-zombie/components";
import { c } from "game-zombie/config";
import { cskill } from "game-zombie/skills/skill.editors";
import { Texture } from "pixi.js";
import { Skill } from "../../skill";
import { NumProperty } from "../../skill-property";
import { SoundsZombie } from "game-zombie/sounds-zombie";
import { di } from "@elumixor/di";

@c
export class FartSkill extends Skill {
    override readonly name = "Deadly Fart";
    override readonly description = "Releases a stinky cloud that damages enemies.";
    override readonly texture = Texture.from("ui-fart");

    private readonly sounds = di.inject(SoundsZombie);

    @cskill protected readonly damage = this.addProperty(new NumProperty("Damage"));
    @cskill protected readonly radius = this.addProperty(new NumProperty("Radius"));
    @cskill protected readonly cooldown = this.addProperty(new NumProperty("Cooldown"));

    private component?: AuraWeaponComponent;

    protected override addToActor(actor: Actor) {
        this.component = new AuraWeaponComponent(actor);
        this.component.sounds = this.sounds.skills.fart;
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
