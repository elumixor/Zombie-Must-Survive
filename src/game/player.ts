import { inject, injectable } from "@core/di";
import { responsive } from "@core/responsive";
import { Controls, type Subscription } from "controls";
import { Container } from "pixi.js";
import { Resources } from "resources";
import { withHealth } from "./health";
import { damageDealer } from "./damage-dealer";
import { gsap } from "gsap";

@injectable
@responsive
export class Player extends damageDealer(withHealth(Container)) {
    readonly movementSpeed = 3;
    readonly radius = 30;

    private readonly resources = inject(Resources);
    private readonly controls = inject(Controls);

    @responsive({ scale: 0.1, y: 20 })
    private readonly spine = this.resources.player;

    private _moving = false;

    private moveSubscription?: Subscription;

    constructor() {
        super();

        this.addChild(this.spine);

        // Animate on hit - tween to red
        this.tintOnHit(this.spine);

        // Animate on death
        this.died.subscribe(() => {
            this.onDeath();
        });

        this.alpha = 0;
    }

    set moving(value: boolean) {
        if (this._moving === value) return;
        this._moving = value;

        if (value) this.run();
        else this.idle();
    }

    reset() {
        this._died = false;
        gsap.to(this, { alpha: 1, duration: 1 });
        this.spine.animate("idle", { loop: true });

        // Subscribe to controls
        this.moveSubscription = this.controls.onMove(this.move);
        this.controls.movementChanged.subscribe(this.onMovementChanged);
    }

    private run() {
        this.spine.animate("run", { loop: true });
    }

    private idle() {
        this.spine.animate("idle", { loop: true });
    }

    private readonly move = (dx: number, dy: number, dt: number) => {
        this.x += dx * dt * this.movementSpeed;
        this.y += dy * dt * this.movementSpeed;
    };

    private readonly onMovementChanged = ([dx, dy]: [number, number]) => {
        if (dx === 0) {
            if (dy === 0) this.moving = false;
            else this.moving = true;
            return;
        }

        const { x } = this.spine.scale;
        this.spine.scale.x = Math.abs(x) * dx;
        this.moving = true;
    };

    private onDeath() {
        this.moveSubscription?.unsubscribe();
        this.controls.movementChanged.unsubscribe(this.onMovementChanged);
        this.spine.animate("death");
    }
}
