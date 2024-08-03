import {
    Actor,
    App,
    circleSprite,
    inject,
    rectSprite,
    responsive,
    type IDimensions,
    type IResizeObservable,
} from "@core";
import { Controls as GameControls } from "game-zombie/controls";
import { Container, FederatedPointerEvent } from "pixi.js";

@responsive
export class ControlsWidget extends Actor implements IResizeObservable {
    tickEnabled = false;

    private readonly app = inject(App);
    private readonly controls = inject(GameControls);

    private readonly radius = 70;
    private readonly thumbRadius = this.radius * 0.6;
    private readonly travel = this.radius * 0.75;

    @responsive({ pin: 0.5, anchor: 0.5 })
    private readonly overlay = rectSprite({ alpha: 0 });

    @responsive({ pin: [0.5, 0.75] })
    private readonly joystickContainer = new Container();

    @responsive({ anchor: 0.5 })
    private readonly base = circleSprite({ radius: this.radius, alpha: 0.5 });

    @responsive({ anchor: 0.5 })
    private readonly thumb = circleSprite({ radius: this.thumbRadius, alpha: 0.8 });

    private _scale = 1;

    constructor() {
        super();

        this.layer = "ui";
        this.thumb.position.copyFrom(this.base.position);

        this.addChild(this.overlay, this.joystickContainer);
        this.joystickContainer.addChild(this.base, this.thumb);

        this.interactive = true;

        this.on("pointerdown", this.onPointerDown);
        this.time.pausedChanged.subscribe((paused) => {
            if (paused) {
                this.onPointerUp();
                this.off("pointerdown", this.onPointerDown);
            } else this.on("pointerdown", this.onPointerDown);
        });
    }

    set hidden(value: boolean) {
        this.visible = !value;
    }

    resize({ scale, width, height }: IDimensions) {
        this._scale = scale;
        this.overlay.width = width;
        this.overlay.height = height;
    }

    private readonly onPointerDown = (event: FederatedPointerEvent) => {
        this.app.stage.interactive = true;
        this.app.stage.on("pointermove", this.onPointerMove);
        this.app.stage.on("pointerup", this.onPointerUp);

        this.base.x = event.x / this._scale - this.joystickContainer.x;
        this.base.y = event.y / this._scale - this.joystickContainer.y;

        this.thumb.position.copyFrom(this.base.position);
    };

    private readonly onPointerMove = (event: FederatedPointerEvent) => {
        const ex = event.x / this._scale - this.joystickContainer.x;
        const ey = event.y / this._scale - this.joystickContainer.y;

        const { x, y } = this.base;

        let dx = ex - x;
        let dy = ey - y;

        const n = norm(dx, dy);
        const distance = min(n, this.travel);

        dx *= distance / n;
        dy *= distance / n;

        this.thumb.position.set(dx + x, dy + y);
        this.controls.move(dx / this.travel, dy / this.travel);
    };

    private readonly onPointerUp = () => {
        this.app.stage.off("pointermove", this.onPointerMove);
        this.app.stage.off("pointerup", this.onPointerUp);

        this.app.stage.interactive = false;
        this.controls.move(0, 0);
        this.thumb.position.set(0);
        this.base.position.set(0);
    };
}
