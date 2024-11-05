import { di } from "@elumixor/di";
import { SoundsZombie } from "game-zombie/sounds-zombie";
import { PeriodicSkillComponent } from "../periodic-skill-component";
import { BoomerangActor } from "./boomerang-actor";

export class BoomerangComponent extends PeriodicSkillComponent {
    private readonly sounds = di.inject(SoundsZombie);

    damage = 5;
    instances = 1;
    radius = 100;
    speed = 0.05;
    lifetime = 5;

    protected override activate() {
        void this.sounds.skills.boomerang.play();

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

    private destroyCurrent(boomerangs: BoomerangActor[]) {
        for (const boomerang of boomerangs) boomerang.flyRadiusIncrease = 0.5;
    }
}
