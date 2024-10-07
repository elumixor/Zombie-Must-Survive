import { Actor } from "@core";
import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
import { GameState } from "game-zombie/game-state";
import { PickUp } from "./pick-up";
import { c } from "game-zombie/config";
import { ResourcesZombie } from "game-zombie/resources-zombie";

@c
export class XpCrystal extends PickUp {
    private readonly playerState = di.inject(GameState).player;
    private readonly resources = di.inject(ResourcesZombie);

    @c(c.num(), { tabGroup: "Player" })
    xpGain = 1;

    @c(c.bool(), { tabGroup: "Player" })
    private noXP = false;

    private readonly spine = this.addChild(this.resources.brain.copy());

    constructor() {
        super();

        this.layer = "foreground";

        this.collected.subscribe(() => (this.playerState.xp += this.noXP ? 0 : this.xpGain));
    }

    override beginPlay() {
        super.beginPlay();
        void this.animateShow();
    }

    protected override async animateShow() {
        await all(super.animateShow(), this.spine.animate("appear", { promise: true, speed: random(0.8, 1.2) }));
        this.spine.animate("idle", { loop: true });
    }

    protected override async animateHide() {
        // await all(
        //     this.time.to(this.sprite, { alpha: 0, duration: 0.5, ease: "expo.out", overwrite: true }),
        //     this.time.to(this.sprite.scale, { x: 1.2, y: 1.2, duration: 0.5, overwrite: true }),
        // );
    }

    protected override flyToTarget(target: Actor) {
        super.flyToTarget(target);

        // void this.time
        //     .to(this.shadow.scale, { x: 0, y: 0, duration: 0.15, overwrite: true })
        //     .then(() => this.removeChild(this.shadow));
    }
}
