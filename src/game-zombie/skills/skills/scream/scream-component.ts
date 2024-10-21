import { Component, Time } from "@core";
import { di } from "@elumixor/di";
import { SoundsZombie } from "game-zombie/sounds-zombie";
import { ScreamActor } from "./scream-actor";

export class ScreamComponent extends Component {
    private readonly time = di.inject(Time);
    private readonly sounds = di.inject(SoundsZombie);

    radius = 1;
    freezeDuration = 1;
    cooldown = 1;
    growSpeed = 1;

    private interval?: ReturnType<Time["timeout"]>;

    override beginPlay() {
        super.beginPlay();

        this.updateParams();
    }

    override destroy() {
        super.destroy();

        this.stop();
    }

    updateParams() {
        if (!this.beginPlayCalled) return;

        this.stop();

        this.interval = this.time.interval(() => this.activate(), this.cooldown);
    }

    private stop() {
        this.interval?.clear();
        this.interval = undefined;
    }

    private activate() {
        const scream = new ScreamActor();
        void this.sounds.skills.scream.play();

        scream.radius = this.radius;
        scream.freezeDuration = this.freezeDuration;
        scream.growSpeed = this.growSpeed;

        this.actor.addChild(scream);
    }
}
