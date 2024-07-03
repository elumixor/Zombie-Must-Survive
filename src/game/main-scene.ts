import { App } from "@core/app";
import { inject } from "@core/di";
import { responsive } from "@core/responsive";
import { Resizer, type IDimensions } from "@core/responsive/resizer";
import { Viewport } from "pixi-viewport";
import { Container, Graphics, Ticker } from "pixi.js";
import { Player } from "./player";

@responsive
export class MainScene extends Container {
    private readonly app = inject(App);
    private readonly resizer = inject(Resizer);
    private readonly player = new Player();

    private readonly worldWidth = 1000;
    private readonly worldHeight = 1000;

    private readonly viewport = new Viewport({
        screenWidth: this.resizer.width,
        screenHeight: this.resizer.height,
        worldWidth: this.worldWidth,
        worldHeight: this.worldHeight,
        events: this.app.renderer.events,
    });

    constructor() {
        super();

        debug.fn(() => {
            const line = this.viewport.addChild(new Graphics());
            line.lineStyle(10, 0xff0000).drawRect(0, 0, this.worldWidth, this.worldHeight);
        });

        this.viewport.addChild(this.player);
        this.addChild(this.viewport);

        this.viewport.fit();
        this.viewport.moveCenter(this.worldWidth / 2, this.worldHeight / 2);

        this.player.position.copyFrom(this.viewport.center);

        // Follow the player
        Ticker.shared.add(this.followPlayer);
    }

    // Change the viewport's center to follow the player
    // Unfortunately, viewport.follow() produced a jittery effect
    private readonly followPlayer = (dt: number) => {
        const { x: cx, y: cy } = this.viewport.center;
        const { x: tx, y: ty } = this.player.position;

        const dx = tx - cx;
        const dy = ty - cy;
        const speed = 0.1;

        const x = cx + dx * dt * speed;
        const y = cy + dy * dt * speed;

        this.viewport.moveCenter(x, y);
    };

    resize({ height, width }: IDimensions) {
        this.viewport.screenHeight = height;
        this.viewport.screenWidth = width;
        this.viewport.fit();
        this.viewport.moveCenter(this.player.position);
    }
}
