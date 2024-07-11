import { EventEmitter, type Constructor } from "@elumixor/frontils";

export function withXp<T extends Constructor>(Base: T) {
    return class extends Base {
        readonly levelChanged = new EventEmitter<number>();
        readonly xpChanged = new EventEmitter<number>();

        private _xp = 0;

        private factor = 10;

        get level() {
            const b = this.factor / 2;
            const a = b;
            const c = -this._xp;

            const D = b * b - 4 * b * c;
            if (D < 0) throw new Error(`Invalid negative xp ${this._xp}`);

            // Only the positive root is valid
            return Math.floor((-b + Math.sqrt(D)) / (2 * a)) + 1;
        }

        get xp() {
            return this._xp;
        }
        set xp(value) {
            if (this._xp === value) return;

            const previousLevel = this.level;
            this._xp = value;

            const level = this.level;
            if (previousLevel !== level) this.levelChanged.emit(level);

            this.xpChanged.emit(value);
        }

        get nextLevelXp() {
            const n = this.level;
            return (n * (n + 1) * this.factor) / 2;
        }

        get previousLevelXp() {
            const n = this.level - 1;
            return (n * (n + 1) * this.factor) / 2;
        }

        get remainingXp() {
            return this.nextLevelXp - this.xp;
        }
    };
}
