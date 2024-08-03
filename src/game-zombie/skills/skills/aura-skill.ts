import { Actor } from "@core";
import { AuraWeaponComponent } from "game-zombie/components";
import { Skill } from "../skill";
import { NumProperty } from "../skill-property";

export class AuraSkill extends Skill {
    readonly name = "Stinky Aura";
    readonly description = "A deadly cloud of stench";

    protected readonly damage = this.addProperty(new NumProperty("Damage", (level) => 3 + (level - 1) * 0.2));
    protected readonly radius = this.addProperty(
        new NumProperty("Radius", (level) => 100 + (level > 3 ? 10 * level : 0)),
    );
    protected readonly cooldown = this.addProperty(new NumProperty("Cooldown", (level) => 0.5 * 0.95 ** level));

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
