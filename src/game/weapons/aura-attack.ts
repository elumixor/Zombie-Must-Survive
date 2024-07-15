import type { ICircleContainer } from "game/circle-container";
import { Container, type ColorSource } from "pixi.js";
import { Weapon } from "./weapon";
import { circleSprite } from "@core/pixi-utils";
import gsap from "gsap";
import { inject } from "@core/di";
import { GameTime } from "game/game-time";

export class AuraAttack extends Weapon {
    private readonly time = inject(GameTime);

    private readonly color;
    private readonly radius;

    // We want to follow the carrier
    private readonly containers = [] as Container[];

    constructor({
        color,
        carrier,
        targetType,
        damage,
        radius,
        triggerRange = radius * 2,
        rate,
    }: {
        color: ColorSource;
        carrier: ICircleContainer;
        targetType: "enemy" | "player";
        damage: number;
        radius: number;
        triggerRange?: number;
        rate: number;
    }) {
        super(carrier, targetType, damage, triggerRange, rate);

        this.radius = radius;
        this.color = color;
    }

    protected use() {
        if (!this.canUse) return;
        for (const target of this.targetsInRange) if (this.distanceTo(target) <= this.radius) target.hp -= this.damage;

        const sprite = circleSprite({ radius: this.radius, color: this.color, alpha: 0.5 });
        const container = new Container();
        container.addChild(sprite);

        const update = () => container.position.copyFrom(this.carrier);
        this.time.add(update);

        const tl = gsap.timeline();
        tl.fromTo(sprite, { alpha: 0 }, { alpha: 1, duration: 0.1 });
        tl.fromTo(container.scale, { x: 1, y: 1 }, { x: 1.05, y: 1.05, duration: 0.2 }, "<");
        void tl.to(sprite, { alpha: 0, duration: 0.2 }, "<+0.1").then(() => {
            this.time.remove(update);
            this.containers.remove(container);
            container.destroy();
        });

        container.position.copyFrom(this.carrier);
        this.containers.push(container);

        this.world.spawn(container);
    }
}
