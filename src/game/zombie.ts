import { responsive } from "@core/responsive";
import { EventEmitter } from "@elumixor/frontils";
import { Container, Point, Sprite, type IPointData } from "pixi.js";

@responsive
export class Zombie extends Container {
    readonly died = new EventEmitter();

    @responsive({ scale: 1, anchor: 0.5 })
    private readonly sprite = Sprite.from("zombie");

    readonly speed = new Point();

    private lastChanged = 0;
    private readonly maxSpeed = 2;

    constructor(public mass: number) {
        super();
        this.addChild(this.sprite);
    }

    update(force: IPointData, dt: number) {
        this.speed.x += (force.x / this.mass) * dt;
        this.speed.y += (force.y / this.mass) * dt;

        const factor = this.maxSpeed / Math.hypot(this.speed.x, this.speed.y);

        this.speed.x *= factor;
        this.speed.y *= factor;

        this.x += this.speed.x * dt;
        this.y += this.speed.y * dt;

        this.changeScale(Math.sign(this.speed.x));
    }

    private changeScale(scaleX: number) {
        if (Date.now() - this.lastChanged > 300) {
            this.scale.x = scaleX;
            this.lastChanged = Date.now();
        }
    }
}
