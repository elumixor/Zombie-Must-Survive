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

    private spawnInterval?: ReturnType<Time["interval"]>;

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

        this.spawnInterval = this.time.interval(() => this.spawn(), this.cooldown);
    }

    private spawn() {
        const angleDiff = (Math.PI * 2) / this.instances;

        const boomerangs = range(this.instances).map((i) => {
            const boomerang = new BoomerangActor();
            boomerang.flyAngle = angleDiff * i;
            boomerang.flyRadius = this.radius;
            boomerang.speed = this.speed;
            boomerang.damage = this.damage;
            this.actor.addChild(boomerang);
            return boomerang;
        });

        void this.time.delay(this.lifetime).then(() => this.destroyCurrent(boomerangs));
    }

    private stop() {
        this.spawnInterval?.clear();
        this.spawnInterval = undefined;
    }

    private destroyCurrent(boomerangs: BoomerangActor[]) {
        for (const boomerang of boomerangs) boomerang.flyRadiusIncrease = 0.5;
    }
}
