import { Component, Time } from "@core";
import { di } from "@elumixor/di";

export abstract class PeriodicSkillComponent extends Component {
    protected readonly time = di.inject(Time);
    override tickEnabled = false;
    cooldown = 1;

    private interval?: ReturnType<Time["timeout"]>;

    override destroy() {
        super.destroy();
        this.stop();
    }

    updateParams() {
        if (!this.beginPlayCalled) return;

        this.stop();

        this.interval = this.time.interval(() => this.activate(), this.cooldown, true);
    }

    protected abstract activate(): void;

    private stop() {
        this.interval?.clear();
        this.interval = undefined;
    }
}
