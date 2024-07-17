import { inject } from "@core/di";
import { responsive } from "@core/responsive";
import { Crystal } from "game/crystal";
import type { Weapon } from "game/weapons";
import { World } from "game/world";
import { gsap } from "gsap";
import { Container, Point, Sprite, type IPointData } from "pixi.js";
import { withHp } from "../systems/hp";
import { Text } from "../text";

@responsive
export class Enemy extends withHp(Container) {
    private readonly world = inject(World);
    weapon?: Weapon;

    readonly radius;
    readonly speed = new Point();
    readonly maxSpeed;

    @responsive({ scale: [-0.3, 0.3], anchor: 0.5 })
    private readonly sprite;

    private readonly mass;

    constructor({
        mass,
        sprite,
        hp,
        radius,
        maxSpeed,
    }: {
        sprite: string;
        mass: number;
        maxSpeed: number;
        hp: number;
        radius: number;
    }) {
        super();

        this.mass = mass;
        this.hp = hp;
        this.radius = radius;
        this.maxSpeed = maxSpeed;

        this.sprite = Sprite.from(sprite);

        this.addChild(this.sprite);
        this.tintOnHit(this.sprite);

        this.damaged.subscribe((damage) => this.spawnDamageText(damage));

        this.died.subscribe(() => {
            const crystal = new Crystal();
            crystal.zIndex = -10;
            crystal.position.copyFrom(this);
            this.world.spawn(crystal, { tag: "pickup" });

            gsap.to(this.sprite, {
                alpha: 0,
                angle: -90,
                duration: 0.5,
                ease: "expo.out",
                onComplete: () => this.destroy(),
            });
        });
    }

    update(force: IPointData, dt: number) {
        this.speed.x += (force.x / this.mass) * dt;
        this.speed.y += (force.y / this.mass) * dt;

        const factor = this.maxSpeed / Math.hypot(this.speed.x, this.speed.y);

        this.speed.x *= factor;
        this.speed.y *= factor;

        this.x += this.speed.x * dt;
        this.y += this.speed.y * dt;

        this.scale.x = Math.sign(this.speed.x);

        this.weapon?.tryUse();
    }

    private spawnDamageText(damage: number) {
        const text = new Text(-damage);
        text.zIndex = 10;
        text.anchor.set(0.5);
        this.parent.addChild(text);
        text.position.copyFrom(this.parent.toLocal(new Point(), this));
        text.y -= this.radius - Math.random() * 10;
        gsap.to(text, {
            y: text.y - 20,
            alpha: 0,
            angle: (Math.random() - 0.5) * 20,
            duration: 0.5,
            ease: "expo.out",
            onComplete: () => text.destroy(),
        });
    }
}
