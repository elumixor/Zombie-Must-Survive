import { Component, Time } from "@core";
import { di } from "@elumixor/di";
import { ScreamActor } from "./scream-actor";

export class ScreamComponent extends Component {
    private readonly time = di.inject(Time);

    radius = 1;
    freezeDuration = 1;
    cooldown = 1;
    speed = 1;

    private timeout?: ReturnType<Time["timeout"]>;
    private beginPlayCalled = false;

    private get duration() {
        return this.radius / this.speed;
    }

    beginPlay() {
        super.beginPlay();
        this.beginPlayCalled = true;
        this.updateParams();
    }

    updateParams() {
        if (!this.beginPlayCalled) return;
        this.activate();
        this.timeout?.clear();
        this.timeout = this.time.interval(() => this.activate(), this.cooldown + this.duration);
    }

    private activate() {
        const scream = new ScreamActor();

        scream.radius = this.radius;
        scream.freezeDuration = this.freezeDuration;
        scream.duration = this.duration;

        this.actor.addChild(scream);
    }
}
