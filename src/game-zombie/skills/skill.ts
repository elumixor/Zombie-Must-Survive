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
    protected actor?: Actor;

    /** Level 0 means it is not yet learned */
    @c(c.num())
    get level() {
        return this._level;
    }
    set level(value) {
        if (this._level === value) return;
        this._level = value;
        if (this.actor) this.update(this.actor, value);
    }

    get currentDiff() {
        if (this.level === 0) return this.diff(1);
        return this.diff(this.level, this.level + 1);
    }

    applyTo(actor: Actor) {
        logs(`Applying skill ${this.name}`);

        if (this.actor !== actor) {
            this.actor = actor;
            this.addToActor(actor);
        }

        this.update(actor, this.level);
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

    protected update(_actor: Actor, _level: number) {
        return;
    }
}
