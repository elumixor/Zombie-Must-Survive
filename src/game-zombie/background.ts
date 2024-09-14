import { Actor, responsive, type IDimensions, type IResizeObservable } from "@core";
import { TilingSprite } from "pixi.js";

@responsive
export class Background extends Actor implements IResizeObservable {
    private readonly sprite = this.addChild(TilingSprite.from("background", { width: 1280, height: 723 }));

    constructor() {
        super();

        this.layer = "background";
        this.sprite.anchor.set(0.5);
        this.tickEnabled = false;
    }

    override beginPlay() {
        super.beginPlay();
        this.level.camera.updated.subscribe(() => this.updatePosition());
    }

    resize({ width, height }: IDimensions) {
        this.sprite.width = width * 2;
        this.sprite.height = height * 2;
    }

    updatePosition() {
        const { position } = this.level.camera;
        this.position.copyFrom(position);
        this.sprite.tilePosition.copyFrom(position.mul(-1));
    }
}
