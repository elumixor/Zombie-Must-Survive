import { App } from "@core/app";
import { inject } from "@core/di";
import { circleSprite } from "@core/pixi-utils";
import { responsive } from "@core/responsive";
import { Container, FederatedPointerEvent } from "pixi.js";
import { Controls as GameControls } from "controls";

@responsive
export class Controls extends Container {
    private readonly app = inject(App);
    private readonly controls = inject(GameControls);

    private readonly radius = 50;
    private readonly travel = (this.radius * 3) / 4;

    @responsive({ anchor: 0.5 })
    private readonly base = circleSprite({ radius: this.radius, alpha: 0.5 });

    @responsive({ anchor: 0.5 })
    private readonly thumb = circleSprite({ radius: 30, alpha: 0.8 });

    private readonly zero;
    private touchX = 0;
    private touchY = 0;

    constructor(offset: number) {
        super();

        const dw = this.base.width / 2 + offset;
        const dh = this.base.height / 2 + offset;

        this.base.x += dw;
        this.base.y -= dh;
        this.thumb.position.copyFrom(this.base.position);
        this.zero = this.thumb.position.clone();

        this.addChild(this.base, this.thumb);

        this.thumb.interactive = true;

        this.thumb.on("pointerdown", this.onPointerDown);
    }

    private readonly onPointerDown = (event: FederatedPointerEvent) => {
        this.app.stage.on("pointermove", this.onPointerMove);
        this.app.stage.on("pointerup", this.onPointerUp);

        this.touchX = event.globalX - this.zero.x;
        this.touchY = event.globalY - this.zero.y;
    };

    private readonly onPointerMove = (event: FederatedPointerEvent) => {
        let x = event.globalX - this.touchX;
        let y = event.globalY - this.touchY;

        let dx = x - this.zero.x;
        let dy = y - this.zero.y;

        const norm = Math.hypot(dx, dy);
        const distance = Math.min(norm, this.travel);

        dx *= distance / norm;
        dy *= distance / norm;

        x = this.zero.x + dx;
        y = this.zero.y + dy;

        this.thumb.position.set(x, y);

        this.controls.move(dx / this.travel, dy / this.travel);
    };

    private readonly onPointerUp = () => {
        this.app.stage.off("pointermove", this.onPointerMove);
        this.app.stage.off("pointerup", this.onPointerUp);

        this.controls.move(0, 0);
        this.thumb.position.copyFrom(this.zero);
    };
}
