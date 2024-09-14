import { Actor } from "@core";
import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
import { RayWeapon } from "game-zombie/components";
import { ResourcesZombie } from "game-zombie/resources-zombie";
import { gsap } from "gsap";

/** Turret that shoots a ray towards a random enemy */
export class BeholderTurret extends Actor {
    private readonly resources = di.inject(ResourcesZombie);
    readonly spine = this.addChild(this.resources.beholder.copy());
    readonly weapon = this.addComponent(new RayWeapon(this));

    constructor() {
        super();

        this.layer = "foreground";
        this.weapon.tags.add("enemy");

        this.weapon.onUse.subscribe(async () => {
            await this.spine.animate("attack", { promise: true });
            this.spine.animate("idle", { loop: true });
        });
    }

    beginPlay() {
        super.beginPlay();

        this.spine.animate("idle", { loop: true });

        this.spine.scale.set(0.7);
        this.spine.y = 20;

        void this.time.to(this.spine.scale, {
            x: 1,
            y: 1,
            duration: 0.5,
            ease: "expo.out",
            onComplete: () => {
                void this.time.to(this.spine.scale, { y: 1.05, duration: 0.5, yoyo: true, repeat: Infinity });
                void this.time.to(this.spine, {
                    y: 0,
                    duration: 0.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: Infinity,
                });
            },
        });
    }

    async disappear() {
        gsap.killTweensOf(this.spine);
        gsap.killTweensOf(this.spine.scale);
        await all(
            this.time.to(this.spine, { alpha: 0, y: -200, duration: 1, ease: "expo.in" }),
            this.time.to(this.spine.scale, { x: 1.05, y: 1.05, duration: 1, ease: "expo.in" }),
        );
        this.destroy();
    }
}
