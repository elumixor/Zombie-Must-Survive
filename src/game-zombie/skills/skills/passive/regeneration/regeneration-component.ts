import { Component, Time } from "@core";
import { di } from "@elumixor/di";
import { HealthComponent } from "game-zombie/components";

export class RegenerationComponent extends Component {
    private readonly time = di.inject(Time);
    tickEnabled = false;
    healthPercentRestored = 1;
    private interval?: ReturnType<Time["interval"]>;

    beginPlay() {
        super.beginPlay();
        assert(!this.interval);
        this.interval = this.time.interval(() => this.regenerateHealth(), 1);
    }

    updateParams() {
        if (!this.interval) return;
        this.interval.clear();
        this.interval = this.time.interval(() => this.regenerateHealth(), 1);
    }

    private regenerateHealth() {
        const health = this.actor.getComponent(HealthComponent);
        assert(health);
        health.heal(health.maxHealth * this.healthPercentRestored);
    }

    destroy() {
        super.destroy();
        this.interval?.clear();
    }
}
