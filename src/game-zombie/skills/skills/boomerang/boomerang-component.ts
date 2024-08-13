import { Component, Time } from "@core";
import { BoomerangActor } from "./boomerang-actor";
import { di } from "@elumixor/di";

export class BoomerangComponent extends Component {
    private readonly time = di.inject(Time);

    damage = 5;
    instances = 1;
    radius = 100;
    speed = 0.05;
    lifetime = 5;
    cooldown = 10;

    private readonly boomerangs = new Array<BoomerangActor>();
    private timeout?: ReturnType<Time["timeout"]>;
    private beginPlayCalled = false;

    beginPlay() {
        super.beginPlay();
        this.beginPlayCalled = true;
        this.updateParams();
    }

    updateParams() {
        if (!this.beginPlayCalled) return;

        this.destroyCurrent();
        this.spawn();
    }

    private spawn() {
        this.timeout?.clear();

        const angleDiff = (Math.PI * 2) / this.instances;

        for (let i = 0; i < this.instances; i++) {
            const boomerang = new BoomerangActor();
            boomerang.flyAngle = angleDiff * i;
            boomerang.flyRadius = this.radius;
            boomerang.speed = this.speed;
            boomerang.damage = this.damage;
            this.actor.addChild(boomerang);
            this.boomerangs.push(boomerang);
        }

        this.timeout = this.time.timeout(() => this.nextRound(), this.lifetime);
    }

    private nextRound() {
        this.timeout = this.time.timeout(() => this.spawn(), this.cooldown);
        this.destroyCurrent();
    }

    private destroyCurrent() {
        for (const boomerang of this.boomerangs) boomerang.flyRadiusIncrease = 0.5;
        this.boomerangs.clear();
    }
}
