import { Actor, inject } from "@core";
import { GameState } from "game-zombie/game-state";
import { ProgressBarWidget } from "./progress-bar-widget";
import { XpWidget } from "./xp-widget";

export class PlayerUI extends Actor {
    private readonly playerState = inject(GameState).player;

    private readonly hpBar = this.addChild(
        new ProgressBarWidget({
            max: this.playerState.hp,
            value: this.playerState.maxHp,
            color: {
                fill: "rgb(41, 163, 41)",
                background: "rgb(53, 41, 63)",
            },
            width: 150,
            height: 17,
            border: {
                size: 2,
            },
        }),
    );

    private readonly xpWidget = this.addChild(new XpWidget());

    constructor() {
        super();

        this.hpBar.x = -this.hpBar.width / 2;
        this.xpWidget.x = -this.hpBar.width / 2;

        this.layer = "playerUI";

        this.playerState.hpChanged.subscribe((hp) => {
            this.hpBar.value = hp;
            this.hpBar.max = this.playerState.maxHp;
        });
    }
}
