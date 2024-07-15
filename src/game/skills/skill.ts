import type { ICircleContainer } from "game/circle-container";

export type SkillRarity = "common" | "rare";

export abstract class Skill {
    readonly maxLevel?: number;
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly image: string;
    protected abstract readonly rarities: SkillRarity[];
    readonly usableBy?: string | string[];

    protected _level = 0;
    protected carrier?: ISkilled & ICircleContainer;

    get rarity() {
        return this.rarities[this.level];
    }

    get level() {
        return this._level;
    }
    set level(value) {
        if (this._level === value) return;
        this._level = value;
        this.changeLevel(value);
    }

    get learned() {
        return this.carrier?.skills.includes(this) ?? false;
    }

    applyTo(character: ISkilled & ICircleContainer) {
        character.skills.push(this);
        this.carrier = character;
    }

    abstract update(): void;
    abstract reset(): void;
    abstract levelDescription(level: number): string;

    protected abstract changeLevel(level: number): void;
}

export interface ISkilled {
    readonly skills: Skill[];
}
