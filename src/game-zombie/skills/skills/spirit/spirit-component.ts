import { Component } from "@core";
import { MainLevel } from "game-zombie/actors";
import { Spirit } from "./spirit";

export class SpiritComponent extends Component {
    damage = 3;
    numSpirits = 3;
    chance = 0.5;
    speed = 5;

    override beginPlay() {
        super.beginPlay();

        assert(this.level instanceof MainLevel, "SpiritComponent can only be added to MainLevel");

        this.level.enemyManager.enemyDied.subscribe((enemy) => {
            if (this.chance < random()) return;

            for (let i = 0; i < this.numSpirits; i++) {
                const spirit = new Spirit();
                spirit.damage = this.damage;
                spirit.speed = this.speed;

                this.level.addChild(spirit);
                spirit.worldPosition = enemy.worldPosition;
            }
        });
    }
}
