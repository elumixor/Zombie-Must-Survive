import { inject } from "@core/di";
import { responsive } from "@core/responsive";
import { Controls } from "controls";
import { Container } from "pixi.js";
import { Resources } from "resources";

@responsive
export class Player extends Container {
    movementSpeed = 3;
    collisionDistance = 30;

    private readonly resources = inject(Resources);
    private readonly controls = inject(Controls);

    @responsive({ scale: 0.1, y: 20 })
    private readonly spine = this.resources.player;

    private _moving = false;

    constructor() {
        super();

        this.addChild(this.spine);
        this.spine.animate("idle", { loop: true });

        this.controls.onMove(this.move);
        this.controls.movementChanged.subscribe(([dx, dy]) => {
            if (dx === 0) {
                if (dy === 0) this.moving = false;
                else this.moving = true;

                return;
            }

            const { x } = this.spine.scale;
            this.spine.scale.x = Math.abs(x) * dx;
            this.moving = true;
        });
    }

    set moving(value: boolean) {
        if (this._moving === value) return;
        this._moving = value;

        if (value) this.run();
        else this.idle();
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
}
