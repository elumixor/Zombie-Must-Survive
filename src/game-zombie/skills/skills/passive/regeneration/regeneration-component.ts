import { Component, Time } from "@core";
import { di } from "@elumixor/di";
import { HealthComponent } from "game-zombie/components";

export class RegenerationComponent extends Component {
    private readonly time = di.inject(Time);
    override tickEnabled = false;
    healthPercentRestored = 1;
    private interval?: ReturnType<Time["interval"]>;

    override beginPlay() {
        super.beginPlay();
        this.updateParams();
    }

    updateParams() {
        if (!this.beginPlayCalled) return;

        this.interval?.clear();
        this.interval = this.time.interval(() => this.regenerateHealth(), 1);
    }

    override destroy() {
        super.destroy();
        this.interval?.clear();
    }

    private regenerateHealth() {
        const health = this.actor.getComponent(HealthComponent);
        assert(health);
        health.heal((health.maxHealth * this.healthPercentRestored) / 100);
    }
}
