import { BaseSounds, Sound } from "@core";
import { di } from "@elumixor/di";

@di.injectable
export class SoundsZombie extends BaseSounds {
    readonly enemyHit = [new Sound("enemies_sfx/hit_1"), new Sound("enemies_sfx/hit_2")];
    readonly skills = {
        beholder: {
            attack: new Sound("abilities_sfx/beholder_atk"),
            spawn: new Sound("abilities_sfx/beholder_spawn"),
        },
        scream: new Sound("abilities_sfx/banshee"),
        boomerang: new Sound("abilities_sfx/boomerang"),
        fart: [new Sound("abilities_sfx/farts_1"), new Sound("abilities_sfx/farts_2")],
        reflux: new Sound("abilities_sfx/reflux_atk"),
        acidPool: new Sound("abilities_sfx/vomit"),
    };
}
