import { Actor, responsive, type IDimensions, type IResizeObservable } from "@core";
import { TilingSprite } from "pixi.js";
import { Grave } from "./grave";

@responsive
export class Background extends Actor implements IResizeObservable {
    private readonly sprite = this.addChild(TilingSprite.from("background", { width: 1280, height: 723 }));

    private readonly gravesMap = new Map<string, boolean>();
    private readonly cellSize = 2000;
    private readonly gravesPerCell = 20;
    private ix?: number;
    private iy?: number;

    constructor() {
        super();

        this.layer = "background";
        this.sprite.anchor.set(0.5);
        this.tickEnabled = false;
    }

    override beginPlay() {
        super.beginPlay();
        this.level.camera.updated.subscribe(() => this.updatePosition());
        this.updatePosition();
    }

    resize({ width, height }: IDimensions) {
        this.sprite.width = width * 2;
        this.sprite.height = height * 2;
    }

    updatePosition() {
        const { position } = this.level.camera;
        this.position.copyFrom(position);
        this.sprite.tilePosition.copyFrom(position.mul(-1));

        const { x, y } = this;
        const ix = round(x / this.cellSize);
        const iy = round(y / this.cellSize);

        if (ix !== this.ix || iy !== this.iy) {
            for (const dx of [-1, 0, 1])
                for (const dy of [-1, 0, 1]) this.placeGraves(ix + dx, iy + dy, `${ix + dx},${iy + dy}`);

            this.ix = ix;
            this.iy = iy;
        }
    }

    private placeGraves(ix: number, iy: number, key: string) {
        if (this.gravesMap.has(key)) return;
        this.gravesMap.set(key, true);

        for (const _ of range(this.gravesPerCell)) {
            const grave = new Grave();
            this.level.addChild(grave);

            grave.x = (ix + random() - 0.5) * this.cellSize;
            grave.y = (iy + random() - 0.5) * this.cellSize;
        }
    }
}
