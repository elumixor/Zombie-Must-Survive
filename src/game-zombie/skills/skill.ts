import type { Actor } from "@core";
import { Texture } from "pixi.js";
import { SkillProperty } from "./skill-property";
import { c } from "game-zombie/config";

export class Skill {
    readonly properties = new Array<SkillProperty>();
    readonly name: string = "Skill Name";
    readonly description: string = "Skill Description";
    readonly texture = Texture.EMPTY;
    readonly maxLevel?: number;
    protected _level = 0;
    actor?: Actor;

    /** Level 0 means it is not yet learned and should not be active on the actor */
    @c(c.num({ min: 0, max: 5, slider: true, step: 1 }), { saved: false, section: "Skills" })
    get level() {
        return this._level;
    }
    set level(value) {
        const previous = this._level;
        if (previous === value) return;
        this._level = value;

        if (previous === 0 && value > 0 && this.actor) this.addToActor(this.actor);
        else if (previous > 0 && value === 0 && this.actor) this.removeFromActor(this.actor);

        if (this.actor && value > 0) this.update(this.actor, value);
    }

    get currentDiff() {
        if (this.level === 0) return this.diff(1);
        return this.diff(this.level, this.level + 1);
    }

    applyTo(actor: Actor) {
        logs(`Applying skill ${this.name}`);

        if (this.actor !== actor) {
            if (this.level > 0 && this.actor) this.removeFromActor(this.actor);
            this.actor = actor;
            if (this.level > 0) this.addToActor(actor);
        }

        if (this.level > 0) this.update(actor, this.level);
    }

    diff(levelBefore: number, levelAfter?: number) {
        return [...this.properties]
            .map((property) => property.diff(levelBefore, levelAfter))
            .filter((s) => s !== "")
            .join("\n");
    }

    protected addProperty<T extends SkillProperty[]>(...property: T) {
        this.properties.push(...property);
        return property.first as T[0];
    }

    protected addToActor(_actor: Actor) {
        return;
    }

    protected removeFromActor(_actor: Actor) {
        return;
    }

    update(_actor: Actor, _level: number) {
        return;
    }
}
