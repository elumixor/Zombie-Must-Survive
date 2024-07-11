import { inject, injectable } from "@core/di";
import { responsive, type IDimensions, type IResizeObservable } from "@core/responsive";
import { Container, TilingSprite } from "pixi.js";
import { GameTime } from "./game-time";
import { Player } from "./player";
import { Enemy } from "./enemies";

@injectable
@responsive
export class World extends Container implements IResizeObservable {
    private readonly time = inject(GameTime);

    private readonly container = new Container();

    @responsive({ anchor: 0.5 })
    private readonly background = TilingSprite.from("background", { width: 500, height: 500 });
    private readonly foreground = new Container();

    private tracked?: Container;

    private readonly MAX_DISTANCE = 50;
    private readonly MAX_SCALE = 1.3;

    private readonly targets = new Map<string, Set<Container>>();

    constructor() {
        super();

        this.addChild(this.background, this.container);
        this.container.addChild(this.foreground);

        this.foreground.sortableChildren = true;
    }

    get player() {
        return this.foreground.children.find((child) => child instanceof Player);
    }

    get enemies() {
        return this.foreground.children.filter((child) => child instanceof Enemy);
    }

    getTargets(name: string) {
        if (!this.targets.has(name)) this.targets.set(name, new Set());
        return this.targets.get(name)!;
    }

    track(target: Container, instantly?: true) {
        this.stopTracking();

        this.tracked = target;

        if (instantly) {
            const { x, y } = target;
            this.container.position.set(-x, -y);
            this.background.tilePosition.set(-x, -y);
        }

        // Follow the player
        this.time.add(this.followPlayer);
    }

    stopTracking() {
        this.tracked = undefined;
        this.time.remove(this.followPlayer);
    }

    spawn(obj: Container, { tag, relative = false }: { relative?: boolean; tag?: string } = {}) {
        this.foreground.addChild(obj);

        if (tag) {
            this.getTargets(tag).add(obj);
            obj.on("destroyed", () => this.getTargets(tag).delete(obj));
        }

        if (relative) {
            obj.x -= this.container.x;
            obj.y -= this.container.y;
        }
    }

    reset() {
        this.container.position.set(0);
        this.scale.set(1);
        this.stopTracking();
        this.background.tilePosition.set(0);
        this.foreground.removeChildren();
    }

    resize({ width, height }: IDimensions) {
        this.background.width = width;
        this.background.height = height;
    }

    // We need to keep player at the center, by moving the world
    private readonly followPlayer = (dt: number) => {
        const { x: px, y: py } = this.tracked!;
        const { x: wx, y: wy } = this.container.position;

        // Target
        const tx = -px;
        const ty = -py;

        const dx = tx - wx;
        const dy = ty - wy;
        const speed = 0.1;

        this.container.x += dx * speed * dt;
        this.container.y += dy * speed * dt;

        // Based on the distance, we should also slowly interpolate the zoom value
        // if the distance is 0, then scale should be MAX_SCALE
        // If the distance is MAX_DISTANCE, then scale should be 1
        const distance = Math.min(Math.hypot(dx, dy), this.MAX_DISTANCE);
        const targetScale = 1 + (this.MAX_SCALE - 1) * (1 - distance / this.MAX_DISTANCE);
        const diff = targetScale - this.scale.x;

        this.scale.x += diff * speed * dt;
        this.scale.y += diff * speed * dt;

        this.background.tilePosition.x = this.container.x;
        this.background.tilePosition.y = this.container.y;
    };
}
