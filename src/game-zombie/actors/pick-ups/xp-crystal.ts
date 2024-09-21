import { Actor } from "@core";
import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
import { GameState } from "game-zombie/game-state";
import { Sprite } from "pixi.js";
import { PickUp } from "./pick-up";
import { c } from "game-zombie/config";

@c
export class XpCrystal extends PickUp {
    private readonly playerState = di.inject(GameState).player;

    @c(c.num(), { tabGroup: "Player" })
    xpGain = 1;

    @c(c.bool(), { tabGroup: "Player" })
    private noXP = false;

    private readonly shadow = this.addChild(Sprite.from("shadow"));
    private readonly sprite = this.addChild(Sprite.from("crystal"));

    constructor() {
        super();

        this.layer = "foreground";

        this.sprite.anchor.set(0.5, 0.5);
        this.shadow.anchor.set(0.5, 0);

        this.shadow.y = 5;

        this.collected.subscribe(() => (this.playerState.xp += this.noXP ? 0 : this.xpGain));
    }

    override beginPlay() {
        super.beginPlay();
        void this.animateShow();
    }

    protected override async animateShow() {
        await all(
            this.time.fromTo(this.sprite, { y: 20 }, { y: 0, duration: 0.2 }),
            this.time.fromTo(this.shadow.scale, { x: 0, y: 0 }, { x: 0.9, y: 0.9, duration: 0.2 }),
        );

        this.time.to(this.sprite, { angle: -5, duration: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
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
