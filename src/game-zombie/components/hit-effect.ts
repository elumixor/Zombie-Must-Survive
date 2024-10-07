import { Component, Time } from "@core";
import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
// import { ColorOverlayFilter } from "@pixi/filter-color-overlay";
import { TextWidget } from "game-zombie/ui";
import type { DisplayObject, ITextStyle } from "pixi.js";

export class HitEffectComponent extends Component {
    readonly textConfig = {
        fontSize: 30,
    } as ITextStyle;

    private readonly time = di.inject(Time);
    // private readonly filter = new ColorOverlayFilter(0xff0000);
    private tween?: gsap.core.Tween;
    // private destroyed = false;

    showText(damage: number, integer = true) {
        if (integer) damage = Math.round(damage);
        const text = new TextWidget(-damage, this.textConfig);
        text.parentLayer = this.level.layers.get("overlay");
        this.level.addChild(text);

        text.anchor.set(0.5);

        this.level.setWorldPosition(text, this.actor.worldPosition);
        text.y -= 40 + random() * 10;

        void this.animateText(text);
    }

    tintSprite(_sprite: DisplayObject) {
        // this.tween?.kill();
        // if (sprite.filters === null) sprite.filters = [];
        // sprite.filters.push(this.filter);
        // this.tween = tweenNumber(0.8, 0, 0.2, (num) => (this.filter.alpha = num));
        // void this.tween.then(() => {
        //     if (!this.destroyed) sprite.filters?.remove(this.filter);
        // });
    }

    override destroy() {
        super.destroy();
        this.tween?.kill();
        // this.destroyed = true;
    }

    private async animateText(text: TextWidget) {
        await all(
            this.time.to(text, { y: text.y - 20, angle: (random() - 0.5) * 20, duration: 0.5, ease: "expo.out" }),
            this.time.to(text, { alpha: 0, duration: 0.25, delay: 0.25, ease: "expo.out" }),
        );
        text.destroy();
    }
}
