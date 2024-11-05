import { Actor, CircleColliderComponent } from "@core";
import { Sprite } from "pixi.js";

export class Grave extends Actor {
    private readonly sprite = this.addChild(Sprite.from(`grave-${ceil(random(3))}`));
    private readonly collider = this.addComponent(new CircleColliderComponent(this));

    constructor() {
        super();

        this.layer = "foreground";

        this.sprite.anchor.set(0.5, 1);

        this.collider.selfTags.add("environment");
        this.collider.radius = 50;
        this.collider.pushStrength = 10000;
    }
}
