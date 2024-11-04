import { Actor } from "@core";
import { di } from "@elumixor/di";
import { SoundsZombie } from "game-zombie/sounds-zombie";
import { Sprite, Texture } from "pixi.js";

export class VolumeButton extends Actor {
    private readonly sprite = this.addChild(Sprite.from("ui-volume-on"));
    private readonly sounds = di.inject(SoundsZombie);

    constructor() {
        super();

        this.sprite.texture = Texture.from(this.sounds.muted ? "ui-volume-off" : "ui-volume-on");
        this.sprite.interactive = true;
        this.sprite.cursor = "pointer";
        this.sprite.anchor.set(1, 0.5);
        this.sprite.scale.set(0.5);
        this.sprite.on("pointerdown", () => this.toggleVolume());
    }

    private toggleVolume() {
        this.sounds.muted = !this.sounds.muted;
        this.sprite.texture = Texture.from(this.sounds.muted ? "ui-volume-off" : "ui-volume-on");
    }
}
