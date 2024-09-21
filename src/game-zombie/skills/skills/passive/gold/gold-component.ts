import { Component, Time } from "@core";
import { di } from "@elumixor/di";
import { Player } from "game-zombie/actors";

export class GoldComponent extends Component {
    private readonly time = di.inject(Time);
    tickEnabled = false;
    goldPerSecond = 1;
    private interval?: ReturnType<Time["interval"]>;

    beginPlay() {
        super.beginPlay();
        this.updateParams();
    }

    updateParams() {
        if (!this.beginPlayCalled) return;

        this.interval?.clear();
        this.interval = this.time.interval(() => this.addGold(), 1);
    }

    private addGold() {
        assert(this.actor instanceof Player);
        this.actor.gold += this.goldPerSecond;
    }

    destroy() {
        super.destroy();
        this.interval?.clear();
    }
}
