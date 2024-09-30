import { Component, Time } from "@core";
import { di } from "@elumixor/di";
import { Player } from "game-zombie/actors";

export class GoldComponent extends Component {
    private readonly time = di.inject(Time);
    override tickEnabled = false;
    goldPerSecond = 1;
    private interval?: ReturnType<Time["interval"]>;

    override beginPlay() {
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

    override destroy() {
        super.destroy();
        this.interval?.clear();
    }
}
