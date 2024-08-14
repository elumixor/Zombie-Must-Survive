import { Actor } from "@core";
import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
import { GameState } from "game-zombie/game-state";
import { Sprite } from "pixi.js";
import { PickUp } from "./pick-up";

export class XpCrystal extends PickUp {
    private readonly playerState = di.inject(GameState).player;

    xp = 1;

    private readonly sprite = this.addChild(Sprite.from("crystal"));
    private readonly shadow = this.addChild(Sprite.from("shadow"));

    constructor() {
        super();

        this.layer = "foreground";

        this.sprite.anchor.set(0.5, 1);
        this.shadow.anchor.set(0.5, 0);

        this.collected.subscribe(() => (this.playerState.xp += this.xp));
    }

    override beginPlay() {
        super.beginPlay();
        void this.animateShow();
    }

    protected override async animateShow() {
        await all(
            this.time.fromTo(this.sprite, { y: 20 }, { y: 0, duration: 0.2 }),
            this.time.fromTo(this.shadow.scale, { x: 0, y: 0 }, { x: 1, y: 1, duration: 0.2 }),
        );

        this.time.to(this.sprite, { y: -20, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
        this.time.to(this.shadow.scale, { x: 0.7, y: 0.7, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }

    protected override async animateHide() {
        await all(
            this.time.to(this.sprite, { alpha: 0, duration: 0.5, ease: "expo.out", overwrite: true }),
            this.time.to(this.sprite.scale, { x: 1.2, y: 1.2, duration: 0.5, overwrite: true }),
        );
    }

    protected override flyToTarget(target: Actor) {
        super.flyToTarget(target);

        void this.time
            .to(this.shadow.scale, { x: 0, y: 0, duration: 0.15, overwrite: true })
            .then(() => this.removeChild(this.shadow));
    }
}
