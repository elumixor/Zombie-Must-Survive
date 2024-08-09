import { Actor } from "@core";
import { all } from "@elumixor/frontils";
import { RayWeapon } from "game-zombie/components";
import { Sprite } from "pixi.js";
import { gsap } from "gsap";

/** Turret that shoots a ray towards a random enemy */
export class BeholderTurret extends Actor {
    readonly sprite = this.addChild(Sprite.from("beholder"));
    readonly weapon = this.addComponent(new RayWeapon(this));

    constructor() {
        super();

        this.layer = "foreground";
        this.weapon.tags.add("enemy");

        this.sprite.anchor.set(0.5, 0.5);
    }

    beginPlay() {
        super.beginPlay();

        this.sprite.scale.set(0.7);
        void this.time.to(this.sprite.scale, {
            x: 1,
            y: 1,
            duration: 0.5,
            ease: "expo.out",
            onComplete: () => {
                void this.time.to(this.sprite.scale, { y: 1.05, duration: 0.5, yoyo: true, repeat: Infinity });
                void this.time.to(this.sprite, {
                    y: -20,
                    duration: 0.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: Infinity,
                });
            },
        });
    }

    async disappear() {
        gsap.killTweensOf(this.sprite);
        gsap.killTweensOf(this.sprite.scale);
        await all(
            this.time.to(this.sprite, { alpha: 0, y: -200, duration: 1, ease: "expo.in" }),
            this.time.to(this.sprite.scale, { x: 1.05, y: 1.05, duration: 1, ease: "expo.in" }),
        );
        this.destroy();
    }
}
