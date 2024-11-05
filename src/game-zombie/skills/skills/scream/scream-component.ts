import { di } from "@elumixor/di";
import { SoundsZombie } from "game-zombie/sounds-zombie";
import { PeriodicSkillComponent } from "../periodic-skill-component";
import { ScreamActor } from "./scream-actor";

export class ScreamComponent extends PeriodicSkillComponent {
    private readonly sounds = di.inject(SoundsZombie);

    radius = 1;
    freezeDuration = 1;
    growSpeed = 1;

    protected override activate() {
        const scream = new ScreamActor();
        void this.sounds.skills.scream.play();

        scream.radius = this.radius;
        scream.freezeDuration = this.freezeDuration;
        scream.growSpeed = this.growSpeed;

        this.actor.addChild(scream);
    }
}
