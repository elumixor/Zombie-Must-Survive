import { di } from "@elumixor/di";
import { all } from "@elumixor/frontils";
import { c } from "game-zombie/config";
import { GameState } from "game-zombie/game-state";
import { ResourcesZombie } from "game-zombie/resources-zombie";
import { PickUp } from "./pick-up";

@c
export class XpCrystal extends PickUp {
    private readonly playerState = di.inject(GameState).player;
    private readonly resources = di.inject(ResourcesZombie);

    @c(c.num(), { tabGroup: "Player" })
    xpGain = 1;

    @c(c.bool(), { tabGroup: "Player" })
    private noXP = false;

    private readonly spine = this.addChild(this.resources.brain.copy());

    constructor(xpFactor = 1) {
        super();

        this.layer = "foreground";

        this.collected.subscribe(() => (this.playerState.xp += this.noXP ? 0 : this.xpGain * xpFactor));
    }

    override beginPlay() {
        super.beginPlay();
        void this.animateShow();
    }

    protected override async animateShow() {
        await all(super.animateShow(), this.spine.animate("appear", { promise: true, speed: random(0.8, 1.2) }));
        this.spine.animate("idle", { loop: true });
    }
}
