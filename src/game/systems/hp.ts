import { tweenNumber } from "@core/pixi-utils";
import type { Spine } from "@core/spine";
import { EventEmitter, type Constructor } from "@elumixor/frontils";
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import type { Sprite } from "pixi.js";

export interface WithHp {
    hp: number;
}

export function withHp<T extends Constructor>(Base: T) {
    return class extends Base {
        readonly hpChanged = new EventEmitter<number>();
        readonly damaged = new EventEmitter<number>();
        readonly healed = new EventEmitter<number>();
        readonly died = new EventEmitter();

        private _hp = 10;

        get dead() {
            return this.hp <= 0;
        }

        get hp() {
            return this._hp;
        }
        set hp(value) {
            value = Math.max(0, value);

            const damage = this._hp - value;
            if (damage === 0) return;
            const dead = this.dead;
            this._hp = value;

            this.hpChanged.emit(value);

            if (damage > 0) this.damaged.emit(damage);
            else this.healed.emit(-damage);

            if (this.hp <= 0 && !dead) this.died.emit();
        }

        tintOnHit(target: Spine | Sprite) {
            let tween: gsap.core.Tween | undefined;
            this.hpChanged.subscribe(() => {
                tween?.kill();
                const filter = new ColorOverlayFilter(0xff0000);
                target.filters = [filter];
                tween = tweenNumber(0.8, 0, 0.2, (num) => (filter.alpha = num));
                void tween.then(() => (target.filters = []));
            });
        }
    };
}
