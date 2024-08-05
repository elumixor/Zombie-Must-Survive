export abstract class SkillProperty<T = void> {
    constructor(
        readonly name: string,
        protected readonly options: { hideZero?: boolean } = {},
    ) {}

    diff(levelBefore: number, levelAfter?: number) {
        if (levelAfter === undefined) {
            const str = this.str(levelBefore);
            if (this.options.hideZero && str === "0") return "";
            return `${this.name}: ${this.highlighted(str)}`;
        }

        const strBefore = this.str(levelBefore);
        const strAfter = this.str(levelAfter);
        if (strBefore === strAfter) return "";
        return `${this.name}: ${this.str(levelBefore)} &rArr; ${this.highlighted(this.str(levelAfter))}`;
    }

    protected str(level: number) {
        return String(this.value(level));
    }

    abstract value(level: number): T;

    private highlighted(text: string) {
        return `<span style='color: rgb(0, 255, 0);'>${text}</span>`;
    }
}

export class NumProperty extends SkillProperty<number> {
    constructor(
        name: string,
        private readonly getValue: (level: number) => number,
        options: { hideZero?: boolean } = {},
    ) {
        super(name, options);
    }

    value(level: number) {
        return this.getValue(level);
    }

    protected override str(level: number) {
        const value = this.value(level);
        if (Number.isInteger(value)) return String(value);
        const str = value.toFixed(2);
        if (str.endsWith("0")) return str.slice(0, -1);
        return str;
    }
}
