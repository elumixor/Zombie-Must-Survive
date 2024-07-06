import { tweenNumber } from "@core/pixi-utils";
import type { Spine } from "@core/spine";
import { EventEmitter, type Constructor } from "@elumixor/frontils";
import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import type { Sprite } from "pixi.js";

export interface WithHealth {
    health: number;
    takeDamage(damage: number): void;
}

export function withHealth<T extends Constructor>(Base: T) {
    return class extends Base {
        readonly died = new EventEmitter();
        readonly damaged = new EventEmitter<number>();

        health = 10;

        protected _died = false;

        takeDamage(damage: number) {
            this.health -= damage;
            this.damaged.emit(damage);
            if (this.health <= 0 && !this._died) {
                this._died = true;
                this.died.emit();
            }
        }

        tintOnHit(target: Spine | Sprite) {
            let tween: gsap.core.Tween | undefined;
            this.damaged.subscribe(() => {
                tween?.kill();
                const filter = new ColorOverlayFilter(0xff0000);
                target.filters = [filter];
                tween = tweenNumber(0.8, 0, 0.2, (num) => (filter.alpha = num));
                void tween.then(() => (target.filters = []));
            });
        }
    };
}
