import { Component } from "@core";
import { MainLevel } from "game-zombie/actors";
import { Zombie } from "./zombie";

export class ZombiecideComponent extends Component {
    damage = 5;
    lifetime = 5;
    maxInstances = 1;

    private currentInstances = 0;

    override beginPlay() {
        super.beginPlay();

        assert(this.level instanceof MainLevel, "ZombiecideComponent can only be added to MainLevel");

        this.level.enemyManager.enemyDied.subscribe((enemy) => {
            if (this.currentInstances >= this.maxInstances) return;
            this.currentInstances++;

            const zombie = new Zombie();
            zombie.weapon.damage = this.damage;
            zombie.lifetime = this.lifetime;
            zombie.died.subscribeOnce(() => this.currentInstances--);

            this.level.addChild(zombie);
            zombie.worldPosition = enemy.worldPosition;
        });
    }
}
